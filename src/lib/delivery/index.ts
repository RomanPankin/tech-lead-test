import type { StoredLead } from '../types';

export interface DeliveryResult {
  ok: boolean;
  destination: string;
  error?: string;
}

export interface DeliveryAdapter {
  readonly name: string;
  send(lead: StoredLead): Promise<DeliveryResult>;
}

/**
 * Email adapter — for lead types routed to a human inbox / transactional ESP
 * (e.g. Postmark, SES). The demo logs instead of sending.
 */
export class EmailAdapter implements DeliveryAdapter {
  readonly name = 'email';
  async send(lead: StoredLead): Promise<DeliveryResult> {
    if (!process.env.EMAIL_PROVIDER_API_KEY) {
      // demo: pretend success, record where it would have gone
      return { ok: true, destination: 'email:demo-inbox' };
    }
    // Real impl: call ESP API here.
    return { ok: true, destination: `email:${lead.country}` };
  }
}

/**
 * 3rd-party CRM/API adapter — for lead types pushed to an external system.
 */
export class CrmApiAdapter implements DeliveryAdapter {
  readonly name = 'crm-api';
  async send(lead: StoredLead): Promise<DeliveryResult> {
    const base = process.env.CRM_API_BASE_URL;
    if (!base) {
      return { ok: true, destination: 'crm-api:demo' };
    }
    try {
      const res = await fetch(`${base}/leads`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${process.env.CRM_API_KEY ?? ''}`,
        },
        body: JSON.stringify(lead),
      });
      if (!res.ok) {
        return { ok: false, destination: `crm-api:${lead.country}`, error: `HTTP ${res.status}` };
      }
      return { ok: true, destination: `crm-api:${lead.country}` };
    } catch (err) {
      return {
        ok: false,
        destination: `crm-api:${lead.country}`,
        error: err instanceof Error ? err.message : 'network error',
      };
    }
  }
}
