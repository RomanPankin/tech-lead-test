'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Alert, Button, Checkbox, SimpleGrid, Stack, Textarea, TextInput } from '@mantine/core';
import { leadSchema, type LeadInput } from '@/lib/leadSchema';
import HoneypotField from './HoneypotField';
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
 * Lead capture form. Wires Zod validation to Mantine inputs via react-hook-form
 * `register`, and delegates the network call to `useLeadSubmit`. The honeypot
 * is the only custom field (no Mantine equivalent); everything else uses
 * Mantine components directly.
 */
export default function LeadCaptureForm() {
  const t = useTranslations('LeadForm');
  const { status, submit } = useLeadSubmit();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { country: 'NZ' },
  });

  async function onSubmit(data: LeadInput) {
    const ok = await submit(data);
    if (ok) reset();
  }

  function renderField(f: TextFieldConfig) {
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
  }

  if (status === 'success') {
    return (
      <Alert color="green" title={t('successTitle')} role="status">
        {t('successBody')}
      </Alert>
    );
  }

  return (
    <form id="lead-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack gap="sm">
        {status === 'error' && (
          <Alert color="red" role="alert">
            {t('errorGeneric')}
          </Alert>
        )}

        {FIELD_ROWS.map((row) =>
          row.length > 1 ? (
            <SimpleGrid key={row[0]!.name} cols={{ base: 1, xs: 2 }} spacing="sm">
              {row.map(renderField)}
            </SimpleGrid>
          ) : (
            renderField(row[0]!)
          ),
        )}

        <HoneypotField />

        <Checkbox
          label={t('acceptTerms')}
          error={errors.acceptTerms?.message}
          {...register('acceptTerms')}
        />

        <Button type="submit" fullWidth mt="xs" loading={status === 'submitting'}>
          {t('submit')}
        </Button>
      </Stack>
    </form>
  );
}
