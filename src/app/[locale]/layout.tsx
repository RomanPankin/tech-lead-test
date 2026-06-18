import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import '@mantine/core/styles.css';
import { routing, type Locale } from '@/i18n/routing';
import { theme } from '@/theme';
import '../globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Per-locale metadata: canonical + hreflang alternates for SEO, plus
 * OpenGraph / Twitter cards for social sharing. Structured (schema.org) data
 * is injected as JSON-LD in the body below.
 */
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}`]));
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Global Leads Platform',
    description: 'Talk to our team — multilingual enquiry capture across 10 markets.',
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages,
    },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/${locale}`,
      title: 'Global Leads Platform',
      description: 'Talk to our team — multilingual enquiry capture across 10 markets.',
      siteName: 'Global Leads Platform',
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Global Leads Platform',
      description: 'Talk to our team — multilingual enquiry capture across 10 markets.',
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Global Leads Platform',
    url: SITE_URL,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      availableLanguage: routing.locales,
    },
  };

  return (
    <html lang={locale} className={sans.variable} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        {/* schema.org structured data for rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <MantineProvider theme={theme}>
          <NextIntlClientProvider messages={messages}>
            <main id="main-content">{children}</main>
          </NextIntlClientProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
