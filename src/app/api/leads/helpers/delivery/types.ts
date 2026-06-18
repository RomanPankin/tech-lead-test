import type { StoredLead } from '../types';

export interface DeliveryResult {
  ok: boolean;
  destination: string;
  error?: string;
}

export interface DeliveryAdapter {
  readonly name: string;
  send(lead: StoredLead): Promise<DeliveryResult>;
}
