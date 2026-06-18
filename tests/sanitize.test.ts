import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeLead } from '@/lib/sanitize';
import type { LeadInput } from '@/lib/leadSchema';

describe('sanitizeText', () => {
  it('strips HTML tags, keeping text content', () => {
    expect(sanitizeText('<b>Jane</b>')).toBe('Jane');
  });

  it('removes script payloads (stored-XSS defence)', () => {
    expect(sanitizeText('<script>alert(1)</script>hi')).toBe('hi');
    expect(sanitizeText('<img src=x onerror=alert(1)>')).toBe('');
  });

  it('trims surrounding whitespace', () => {
    expect(sanitizeText('  spaced  ')).toBe('spaced');
  });

  it('drops control characters', () => {
    const withControl = 'a' + String.fromCharCode(1) + 'bc';
    expect(sanitizeText(withControl)).toBe('abc');
  });
});

describe('sanitizeLead', () => {
  it('sanitises every free-text field', () => {
    const dirty: LeadInput = {
      firstName: '<b>Ada</b>',
      lastName: 'Lovelace<script>x</script>',
      email: 'ada@example.com',
      mobile: '+64 21 555 0000',
      acceptTerms: true,
      marketingReferral: '<i>Google</i>',
      notes: 'hello <a href="#">world</a>',
      country: 'NZ',
    };
    const clean = sanitizeLead(dirty);
    expect(clean.firstName).toBe('Ada');
    expect(clean.lastName).toBe('Lovelace');
    expect(clean.marketingReferral).toBe('Google');
    expect(clean.notes).toBe('hello world');
  });
});
