import { appendFile, readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { LeadStore, StoredLead, DeliveryStatus } from './types';

/**
 * File-backed lead store (JSON Lines) for the demo / local dev.
 *
 * It satisfies the brief's "save data somewhere appropriate" and "store leads
 * in case of delivery failure" requirements without external infrastructure.
 * In production this same interface is implemented by a region-pinned
 * Postgres/RDS adapter so PII is stored in the lead's own jurisdiction.
 */
export class FileLeadStore implements LeadStore {
  constructor(private readonly path: string) {}

  async save(lead: StoredLead): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    await appendFile(this.path, JSON.stringify(lead) + '\n', 'utf8');
  }

  async updateStatus(id: string, status: DeliveryStatus, error?: string): Promise<void> {
    let raw: string;
    try {
      raw = await readFile(this.path, 'utf8');
    } catch {
      return; // nothing persisted yet
    }
    const lines = raw.split('\n').filter(Boolean);
    const updated = lines.map((line) => {
      const lead = JSON.parse(line) as StoredLead;
      if (lead.id !== id) return line;
      lead.deliveryStatus = status;
      lead.deliveryAttempts += 1;
      if (error) lead.lastError = error;
      return JSON.stringify(lead);
    });
    await writeFile(this.path, updated.join('\n') + '\n', 'utf8');
  }
}

let store: LeadStore | null = null;

/** Lazily construct the configured store (singleton per process). */
export function getLeadStore(): LeadStore {
  if (!store) {
    const path = process.env.LEAD_STORE_PATH ?? './data/leads.jsonl';
    store = new FileLeadStore(path);
  }
  return store;
}
