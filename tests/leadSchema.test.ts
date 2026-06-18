import { describe, it, expect } from 'vitest';
import { leadSchema, leadRequestSchema } from '@/lib/leadSchema';

const valid = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ADA@Example.com',
  mobile: '+64 21 555 0000',
  acceptTerms: true,
  country: 'NZ',
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

  it('defaults country to NZ', () => {
    const { country, ...noCountry } = valid;
    expect(leadSchema.parse(noCountry).country).toBe('NZ');
  });
});

describe('leadRequestSchema (honeypot)', () => {
  it('rejects when the honeypot field is filled', () => {
    const res = leadRequestSchema.safeParse({ ...valid, company_website: 'http://spam' });
    expect(res.success).toBe(false);
  });

  it('accepts an empty honeypot', () => {
    const res = leadRequestSchema.safeParse({ ...valid, company_website: '' });
    expect(res.success).toBe(true);
  });
});
