import type { LeadInput, Country } from '@/lib/leadSchema';

export type DeliveryStatus = 'pending' | 'delivered' | 'failed';

/** A lead as persisted: the validated input plus server-assigned metadata. */
export interface StoredLead extends LeadInput {
  id: string;
  /** Country of origin, derived server-side (geo-IP). */
  country: Country;
  receivedAt: string; // ISO 8601
  /** Where this lead is destined, derived from type + country. */
  destination: string;
  deliveryStatus: DeliveryStatus;
  deliveryAttempts: number;
  lastError?: string;
}

/**
 * Storage port. The demo ships a file-backed adapter; production swaps in a
 * region-pinned Postgres adapter behind the same interface (data residency).
 */
export interface LeadStore {
  save(lead: StoredLead): Promise<void>;
  updateStatus(id: string, status: DeliveryStatus, error?: string): Promise<void>;
}
