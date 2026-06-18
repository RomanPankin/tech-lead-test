import type { Country } from '@/lib/leadSchema';
import { EmailAdapter, CrmApiAdapter, type DeliveryAdapter } from './delivery';

/**
 * Routing decides which downstream system(s) a lead is sent to, based on the
 * lead's country of origin (and, in a fuller build, lead type/product line).
 *
 * Modelled as a declarative table so adding a market or changing where its
 * leads go is a config change, not a code change. Countries not listed fall
 * back to email.
 */
const ROUTING_TABLE: Record<string, ('email' | 'crm-api')[]> = {
  NZ: ['email', 'crm-api'],
  AU: ['crm-api'],
  US: ['crm-api'],
  GB: ['crm-api'],
  FR: ['email'],
  DE: ['email'],
  JP: ['crm-api'],
  SG: ['crm-api'],
  CA: ['crm-api'],
  AE: ['email'],
};

const adapters: Record<'email' | 'crm-api', DeliveryAdapter> = {
  email: new EmailAdapter(),
  'crm-api': new CrmApiAdapter(),
};

/** Resolve the ordered list of delivery adapters for a country of origin. */
export function resolveDestinations(country: Country): DeliveryAdapter[] {
  const channels = ROUTING_TABLE[country] ?? ['email'];
  return channels.map((c) => adapters[c]);
}

/** Human-readable summary of where a lead will be sent (stored on the record). */
export function describeDestination(country: Country): string {
  return (ROUTING_TABLE[country] ?? ['email']).join('+') + `:${country}`;
}
