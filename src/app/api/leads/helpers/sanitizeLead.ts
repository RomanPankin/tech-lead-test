import type { LeadInput } from '@/lib/leadSchema';
import { sanitizeText } from './sanitizeText';

/** Sanitise every user-supplied string field on a validated lead. */
export function sanitizeLead(lead: LeadInput): LeadInput {
  return {
    ...lead,
    firstName: sanitizeText(lead.firstName),
    lastName: sanitizeText(lead.lastName),
    email: sanitizeText(lead.email),
    mobile: sanitizeText(lead.mobile),
    marketingReferral: sanitizeText(lead.marketingReferral),
    notes: sanitizeText(lead.notes),
  };
}
