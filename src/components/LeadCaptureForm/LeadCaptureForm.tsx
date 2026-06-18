'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Alert, Button, Checkbox, Textarea, TextInput } from '@mantine/core';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { leadSchema, type LeadInput, type LeadType } from '@/lib/leadSchema';
import { useLeadSubmit } from './useLeadSubmit';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TextFieldConfig = {
  name: keyof LeadInput;
  required?: boolean;
  type?: 'text' | 'email' | 'tel';
  inputMode?: 'email' | 'tel';
  autoComplete?: string;
  multiline?: boolean;
};

/**
 * Fields grouped into rows. A row with two entries renders side-by-side on
 * wider screens (and stacks on narrow ones), keeping the panel compact.
 */
const FIELD_ROWS: TextFieldConfig[][] = [
  [
    { name: 'firstName', required: true, autoComplete: 'given-name' },
    { name: 'lastName', required: true, autoComplete: 'family-name' },
  ],
  [
    { name: 'email', required: true, type: 'email', inputMode: 'email', autoComplete: 'email' },
    { name: 'mobile', required: true, type: 'tel', inputMode: 'tel', autoComplete: 'tel' },
  ],
  [{ name: 'marketingReferral' }],
  [{ name: 'notes', multiline: true }],
];

/**
 * Lead capture form
 */
/**
 * @param leadType Intent of this form/page; routed alongside country. Defaults
 *   to `general` — a "Request a demo" page would pass `sales`, etc.
 */
export function LeadCaptureForm({ leadType = 'general' }: { leadType?: LeadType } = {}) {
  const t = useTranslations('LeadForm');
  const { status, submit } = useLeadSubmit();

  // Cloudflare Turnstile token. Required to submit when a site key is
  // configured; when it isn't (local dev), the challenge is skipped.
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadInput) => {
    const ok = await submit({ ...data, leadType }, turnstileToken);
    if (ok) {
      reset();
    } else {
      // Token is single-use; force a fresh challenge before any retry.
      turnstileRef.current?.reset();
      setTurnstileToken('');
    }
  };

  const renderField = (f: TextFieldConfig) => {
    const common = {
      label: t(f.name),
      withAsterisk: f.required,
      error: errors[f.name]?.message,
      ...register(f.name),
    };

    return f.multiline ? (
      <Textarea key={f.name} autosize minRows={2} maxRows={4} {...common} />
    ) : (
      <TextInput
        key={f.name}
        type={f.type}
        inputMode={f.inputMode}
        autoComplete={f.autoComplete}
        {...common}
      />
    );
  };

  if (status === 'success') {
    return (
      <Alert color="green" title={t('successTitle')} role="status">
        {t('successBody')}
      </Alert>
    );
  }

  return (
    <form
      id="lead-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-3"
    >
      {status === 'error' && (
        <Alert color="red" role="alert">
          {t('errorGeneric')}
        </Alert>
      )}

      {FIELD_ROWS.map((row) =>
        row.length > 1 ? (
          <div key={row[0]!.name} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {row.map(renderField)}
          </div>
        ) : (
          renderField(row[0]!)
        ),
      )}

      <Checkbox
        label={t('acceptTerms')}
        error={errors.acceptTerms?.message}
        {...register('acceptTerms')}
      />

      {TURNSTILE_SITE_KEY && (
        <Turnstile
          ref={turnstileRef}
          siteKey={TURNSTILE_SITE_KEY}
          onSuccess={setTurnstileToken}
          onExpire={() => setTurnstileToken('')}
          onError={() => setTurnstileToken('')}
          options={{ size: 'flexible' }}
        />
      )}

      <Button
        type="submit"
        fullWidth
        mt="xs"
        loading={status === 'submitting'}
        disabled={!!TURNSTILE_SITE_KEY && !turnstileToken}
      >
        {t('submit')}
      </Button>
    </form>
  );
}
