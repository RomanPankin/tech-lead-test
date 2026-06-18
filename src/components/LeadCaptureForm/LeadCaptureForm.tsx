'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Alert, Button, Checkbox, Textarea, TextInput } from '@mantine/core';
import { leadSchema, type LeadInput } from '@/lib/leadSchema';
import { useLeadSubmit } from './useLeadSubmit';

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
export function LeadCaptureForm() {
  const t = useTranslations('LeadForm');
  const { status, submit } = useLeadSubmit();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadInput) => {
    const ok = await submit(data);
    if (ok) reset();
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

      <Button type="submit" fullWidth mt="xs" loading={status === 'submitting'}>
        {t('submit')}
      </Button>
    </form>
  );
}
