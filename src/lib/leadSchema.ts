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

export const leadSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(254),
  mobile: z.string().trim().regex(MOBILE_RE, 'Enter a valid mobile number'),
  // Must be literally true — an unchecked box must fail validation.
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
  // Marketing referral / attribution data (e.g. "Google", utm payload).
  marketingReferral: z.string().trim().max(500).optional().default(''),
  notes: z.string().trim().max(2000).optional().default(''),
  // Country drives both delivery routing and data-residency rules.
  country: z.enum(SUPPORTED_COUNTRIES).default('NZ'),
});

export type LeadInput = z.infer<typeof leadSchema>;

/** Server-side payload includes the anti-spam token + honeypot field. */
export const leadRequestSchema = leadSchema.extend({
  turnstileToken: z.string().optional().default(''),
  // Honeypot: real users never fill this; bots usually do.
  company_website: z.string().max(0, 'Bot detected').optional().default(''),
});

export type LeadRequest = z.infer<typeof leadRequestSchema>;
