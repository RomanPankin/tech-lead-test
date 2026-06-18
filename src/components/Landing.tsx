'use client';

import { useTranslations } from 'next-intl';
import { IconCheck, IconShieldLock, IconSparkles } from '@tabler/icons-react';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

/**
 * Landing page
 */
export function Landing() {
  const t = useTranslations('Home');
  const benefits = [t('benefit1'), t('benefit2'), t('benefit3')];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-800">
      <div className="flex w-full flex-1 items-center justify-center">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 md:grid-cols-12 md:gap-16 md:py-20">
          {/* Brand / value panel */}
          <div className="flex flex-col gap-5 md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white text-slate-700">
                <IconSparkles size={20} />
              </span>
              <span className="text-lg font-bold text-white">{t('brand')}</span>
            </div>

            <p className="m-0 text-sm font-semibold uppercase tracking-[0.08em] text-slate-300">
              {t('eyebrow')}
            </p>
            <h1 className="m-0 text-3xl font-bold leading-tight text-white md:text-5xl">
              {t('title')}
            </h1>
            <p className="m-0 hidden max-w-[460px] text-lg text-slate-200 md:block">{t('intro')}</p>

            <ul className="m-0 hidden list-none space-y-3 p-0 text-white md:block">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
                    <IconCheck size={14} stroke={3} />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Form card */}
          <div className="md:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-xl sm:p-10">
              <div className="mb-4 flex flex-col gap-1">
                <h2 className="m-0 text-xl font-bold text-slate-900 sm:text-2xl">
                  {t('formTitle')}
                </h2>
                <p className="m-0 text-sm text-slate-500">{t('formIntro')}</p>
              </div>

              <LeadCaptureForm />

              <div className="mt-4 flex items-center gap-1.5 text-slate-500">
                <IconShieldLock size={16} />
                <span className="text-xs">{t('secured')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LanguageSwitcher />
    </div>
  );
}
