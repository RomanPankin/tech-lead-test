import DOMPurify from 'isomorphic-dompurify';
import type { LeadInput } from '@/lib/leadSchema';

// Matches ASCII control characters (0x00–0x1F and 0x7F). Built from a string
// so no literal control bytes live in source.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = new RegExp('[\\u0000-\\u001F\\u007F]', 'g');

/**
 * Strip any HTML/script markup and control characters from a free-text value.
 * Defence-in-depth: Zod has already shaped/length-bounded the data, this
 * neutralises stored-XSS and injection payloads before persistence/delivery.
 */
export function sanitizeText(value: string): string {
  // ALLOWED_TAGS [] => return text content only, no markup survives.
  const stripped = DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  return stripped.replace(CONTROL_CHARS, '').trim();
}

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
