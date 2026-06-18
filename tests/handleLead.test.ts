import { describe, it, expect } from 'vitest';
import { handleLead } from '@/app/api/leads/helpers/handleLead';
import type { LeadStore, StoredLead, DeliveryStatus } from '@/app/api/leads/helpers/types';
import type { LeadInput } from '@/lib/leadSchema';

/** In-memory store double so the pipeline is tested without touching disk. */
class MemoryStore implements LeadStore {
  saved: StoredLead[] = [];
  statuses: { id: string; status: DeliveryStatus; error?: string }[] = [];
  /** Status each lead had at the moment save() was called (immutable record). */
  savedAtStatus: DeliveryStatus[] = [];
  async save(lead: StoredLead) {
    this.savedAtStatus.push(lead.deliveryStatus);
    this.saved.push({ ...lead });
  }
  async updateStatus(id: string, status: DeliveryStatus, error?: string) {
    this.statuses.push({ id, status, error });
    const lead = this.saved.find((l) => l.id === id);
    if (lead) {
      lead.deliveryStatus = status;
      lead.deliveryAttempts += 1;
    }
  }
}

const base: LeadInput = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  mobile: '+64 21 555 0000',
  acceptTerms: true,
  marketingReferral: '',
  notes: '<b>note</b>',
};

describe('handleLead', () => {
  it('persists the lead before attempting delivery', async () => {
    const store = new MemoryStore();
    await handleLead(base, 'NZ', store);
    expect(store.saved).toHaveLength(1);
    // saved as 'pending' first — before any delivery attempt mutates it
    expect(store.savedAtStatus[0]).toBe('pending');
  });

  it('sanitises fields before persisting', async () => {
    const store = new MemoryStore();
    await handleLead(base, 'NZ', store);
    expect(store.saved[0]!.notes).toBe('note');
  });

  it('stores the server-derived country and routes by it', async () => {
    const store = new MemoryStore();
    await handleLead(base, 'DE', store);
    expect(store.saved[0]!.country).toBe('DE');
    expect(store.saved[0]!.destination).toContain('DE');
  });

  it('marks delivered when all adapters succeed (demo mode)', async () => {
    const store = new MemoryStore();
    const result = await handleLead(base, 'NZ', store);
    expect(result.deliveryStatus).toBe('delivered');
  });

  it('stamps an id, destination and receivedAt', async () => {
    const store = new MemoryStore();
    const fixed = () => new Date('2026-01-01T00:00:00.000Z');
    const result = await handleLead(base, 'NZ', store, fixed);
    const lead = store.saved[0]!;
    expect(result.id).toBe(lead.id);
    expect(lead.receivedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(lead.destination).toContain('NZ');
  });
});
