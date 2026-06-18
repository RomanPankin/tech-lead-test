import { z } from 'zod';

/**
 * Single source of truth for lead shape + validation.
 *
 * This schema is deliberately framework-agnostic so the Phase 2 mobile app
 * (React Native) can import the exact same rules — one contract, validated
 * identically on web client, mobile client and the server handler.
 */

// Loose E.164-ish check: optional +, 7–15 digits, spaces/dashes tolerated.
const MOBILE_RE = /^\+?[0-9\s-]{7,20}$/;

export const SUPPORTED_COUNTRIES = [
  'NZ',
  'AU',
  'US',
  'GB',
  'FR',
  'DE',
  'JP',
  'SG',
  'CA',
  'AE',
] as const;

/** Country of origin — derived server-side (geo-IP), never user input. */
export type Country = (typeof SUPPORTED_COUNTRIES)[number];

/**
 * Lead type — the enquiry's intent. Set by the form/page context (e.g. a
 * "Request a demo" page sends `sales`), not free-typed by the user. Together
 * with country it determines which downstream system(s) receive the lead.
 */
export const LEAD_TYPES = ['sales', 'support', 'partnership', 'general'] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export const leadSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(254),
  mobile: z.string().trim().regex(MOBILE_RE, 'Enter a valid mobile number'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
  // Marketing referral / attribution data (e.g. "Google", utm payload).
  marketingReferral: z.string().trim().max(500).optional().default(''),
  notes: z.string().trim().max(2000).optional().default(''),
  // Set by form/page context; drives routing alongside country.
  leadType: z.enum(LEAD_TYPES).default('general'),
});

export type LeadInput = z.infer<typeof leadSchema>;

/** Server-side payload includes the anti-spam token */
export const leadRequestSchema = leadSchema.extend({
  turnstileToken: z.string().optional().default(''),
});

export type LeadRequest = z.infer<typeof leadRequestSchema>;
