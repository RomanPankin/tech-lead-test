import type { Country, LeadType } from '@/lib/leadSchema';
import { EmailAdapter, CrmApiAdapter, type DeliveryAdapter } from './delivery';

type Channel = 'email' | 'crm-api';

/**
 * Routing decides which downstream system(s) a lead is sent to, based on BOTH
 * the lead type (intent) and the country of origin.
 *
 * - `TYPE_ROUTING` picks the base channel(s) for the intent (e.g. sales → CRM).
 * - `COUNTRY_ROUTING` adds market-specific channels (e.g. a local CRM required
 *   for data residency), unioned with the type channels.
 *
 * Both are declarative tables, so onboarding a market or changing where a lead
 * type goes is a config change, not a code change.
 */
const TYPE_ROUTING: Record<LeadType, Channel[]> = {
  sales: ['crm-api'],
  support: ['email'],
  partnership: ['email', 'crm-api'],
  general: ['email'],
};

const COUNTRY_ROUTING: Partial<Record<Country, Channel[]>> = {
  NZ: ['email', 'crm-api'],
  AU: ['crm-api'],
  US: ['crm-api'],
  GB: ['crm-api'],
};

// Canonical order so destinations are deterministic regardless of table order.
const CHANNEL_ORDER: Channel[] = ['email', 'crm-api'];

const adapters: Record<Channel, DeliveryAdapter> = {
  email: new EmailAdapter(),
  'crm-api': new CrmApiAdapter(),
};

function resolveChannels(leadType: LeadType, country: Country): Channel[] {
  const set = new Set<Channel>([...TYPE_ROUTING[leadType], ...(COUNTRY_ROUTING[country] ?? [])]);
  return CHANNEL_ORDER.filter((c) => set.has(c));
}

/** Resolve the ordered list of delivery adapters for a lead type + country. */
export function resolveDestinations(leadType: LeadType, country: Country): DeliveryAdapter[] {
  return resolveChannels(leadType, country).map((c) => adapters[c]);
}

/** Human-readable summary of where a lead will be sent (stored on the record). */
export function describeDestination(leadType: LeadType, country: Country): string {
  return `${resolveChannels(leadType, country).join('+')}:${leadType}@${country}`;
}
