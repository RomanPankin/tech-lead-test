import type { StoredLead } from '../types';

export type DeliveryResult = {
  ok: boolean;
  destination: string;
  error?: string;
}

export type DeliveryAdapter = {
  readonly name: string;
  send(lead: StoredLead): Promise<DeliveryResult>;
}
