import { useState } from 'react';
import type { LeadInput } from '@/lib/leadSchema';

export type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Owns the network side of the form: POSTs a validated lead to the API and
 * exposes the request status. Keeps fetch/transport concerns out of the
 * rendering components.
 */
export function useLeadSubmit() {
  const [status, setStatus] = useState<SubmitStatus>('idle');

  async function submit(data: LeadInput, turnstileToken: string): Promise<boolean> {
    setStatus('submitting');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, turnstileToken }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setStatus('success');
      return true;
    } catch {
      setStatus('error');
      return false;
    }
  }

  return { status, submit };
}
