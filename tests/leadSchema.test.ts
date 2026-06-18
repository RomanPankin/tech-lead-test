import { describe, it, expect } from 'vitest';
import { leadSchema, leadRequestSchema } from '@/lib/leadSchema';

const valid = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ADA@Example.com',
  mobile: '+64 21 555 0000',
  acceptTerms: true,
};

describe('leadSchema', () => {
  it('accepts a valid lead and normalises email to lowercase', () => {
    const parsed = leadSchema.parse(valid);
    expect(parsed.email).toBe('ada@example.com');
    expect(parsed.marketingReferral).toBe('');
    expect(parsed.notes).toBe('');
  });

  it('rejects an invalid email', () => {
    expect(leadSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects unchecked terms', () => {
    expect(leadSchema.safeParse({ ...valid, acceptTerms: false }).success).toBe(false);
  });

  it('rejects a malformed mobile number', () => {
    expect(leadSchema.safeParse({ ...valid, mobile: 'abc' }).success).toBe(false);
  });

  it('does not accept a client-supplied country (derived server-side only)', () => {
    const parsed = leadSchema.parse({ ...valid, country: 'US' });
    expect('country' in parsed).toBe(false);
  });
});

describe('leadRequestSchema', () => {
  it('defaults the turnstile token to an empty string', () => {
    const parsed = leadRequestSchema.parse(valid);
    expect(parsed.turnstileToken).toBe('');
  });
});
