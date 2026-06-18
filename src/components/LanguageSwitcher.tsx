'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

/** Endonyms (each language named in itself) for the configured locales. */
const LANGUAGE_NAMES: Record<Locale, string> = {
  en: 'English',
  mi: 'Māori',
  fr: 'Français',
  de: 'Deutsch',
};

/**
 * Footer language switcher. Links to the current path under each locale via
 * next-intl's locale-aware navigation, so switching keeps the user on the same
 * page. `hrefLang` mirrors the SEO alternates declared in the layout metadata.
 */
export default function LanguageSwitcher() {
  const active = useLocale();
  const pathname = usePathname();

  return (
    <nav
      aria-label="Select language"
      className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-4 py-6 text-sm"
    >
      {routing.locales.map((loc) => (
        <Link
          key={loc}
          href={pathname}
          locale={loc}
          lang={loc}
          hrefLang={loc}
          aria-current={loc === active ? 'true' : undefined}
          className={
            loc === active
              ? 'font-semibold text-white'
              : 'text-white/60 transition-colors hover:text-white'
          }
        >
          {LANGUAGE_NAMES[loc]}
        </Link>
      ))}
    </nav>
  );
}
