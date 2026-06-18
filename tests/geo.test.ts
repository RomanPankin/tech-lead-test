import { describe, it, expect } from 'vitest';
import { detectCountry } from '@/app/api/leads/helpers/geo';

const headers = (h: Record<string, string>) => new Headers(h);

describe('detectCountry', () => {
  it('reads the Vercel geo-IP header', () => {
    expect(detectCountry(headers({ 'x-vercel-ip-country': 'DE' }))).toBe('DE');
  });

  it('reads the Cloudflare geo-IP header', () => {
    expect(detectCountry(headers({ 'cf-ipcountry': 'fr' }))).toBe('FR');
  });

  it('falls back to the default when the header is missing', () => {
    expect(detectCountry(headers({}))).toBe('NZ');
  });

  it('falls back when the country is not a supported market', () => {
    expect(detectCountry(headers({ 'x-vercel-ip-country': 'BR' }))).toBe('NZ');
  });
});
