import { defineRouting } from 'next-intl/routing';

/**
 * Phase 1 launches in 10 markets. Locales below are a representative starter
 * set; the routing config is the single source of truth, so adding a market
 * is a one-line change here plus a messages file.
 */
export const routing = defineRouting({
  locales: ['en', 'mi', 'fr', 'de'],
  defaultLocale: 'en',
  // Locale prefix on every path keeps URLs unambiguous for SEO + hreflang.
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
