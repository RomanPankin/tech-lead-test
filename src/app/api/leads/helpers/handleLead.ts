import { randomUUID } from 'node:crypto';
import { sanitizeLead } from './sanitize';
import { resolveDestinations, describeDestination } from './leadRouter';
import { getLeadStore } from './storage';
import type { LeadInput, Country } from '@/lib/leadSchema';
import type { StoredLead, LeadStore } from './types';

export interface HandleResult {
  id: string;
  deliveryStatus: StoredLead['deliveryStatus'];
}

/**
 * Core lead pipeline: sanitise → persist (pending) → attempt delivery →
 * update status. Persisting *before* delivery is deliberate: if every
 * downstream send fails, the lead is still durably stored and can be retried,
 * satisfying "store leads in case of delivery failure".
 *
 * In production the "attempt delivery" step is enqueued onto a durable queue
 * (SQS/Cloud Tasks) with retry + dead-letter, rather than run inline. The
 * shape here mirrors that flow so the swap is mechanical.
 */
export async function handleLead(
  validated: LeadInput,
  country: Country,
  store: LeadStore = getLeadStore(),
  now: () => Date = () => new Date(),
): Promise<HandleResult> {
  const clean = sanitizeLead(validated);

  const lead: StoredLead = {
    ...clean,
    country,
    id: randomUUID(),
    receivedAt: now().toISOString(),
    destination: describeDestination(country),
    deliveryStatus: 'pending',
    deliveryAttempts: 0,
  };

  // Durable storage first — survives any delivery failure.
  await store.save(lead);

  const adapters = resolveDestinations(country);
  const results = await Promise.all(adapters.map((a) => a.send(lead)));
  const allOk = results.every((r) => r.ok);

  if (allOk) {
    await store.updateStatus(lead.id, 'delivered');
    return { id: lead.id, deliveryStatus: 'delivered' };
  }

  const errors = results
    .filter((r) => !r.ok)
    .map((r) => `${r.destination}: ${r.error ?? 'unknown'}`)
    .join('; ');

  // Stays 'failed' in storage → picked up by retry worker.
  await store.updateStatus(lead.id, 'failed', errors);
  return { id: lead.id, deliveryStatus: 'failed' };
}
