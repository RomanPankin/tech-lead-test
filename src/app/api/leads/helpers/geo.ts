import { SUPPORTED_COUNTRIES, type Country } from '@/lib/leadSchema';

const DEFAULT_COUNTRY: Country = 'NZ';

/**
 * Resolve the lead's country of origin from edge geo-IP headers set by the host
 * (Vercel: `x-vercel-ip-country`, Cloudflare: `cf-ipcountry`). Falls back to the
 * default when absent or not a supported market. Never trusts client input.
 */
export function detectCountry(headers: Headers): Country {
  const raw = (headers.get('x-vercel-ip-country') ?? headers.get('cf-ipcountry') ?? '')
    .trim()
    .toUpperCase();

  return (SUPPORTED_COUNTRIES as readonly string[]).includes(raw)
    ? (raw as Country)
    : DEFAULT_COUNTRY;
}
