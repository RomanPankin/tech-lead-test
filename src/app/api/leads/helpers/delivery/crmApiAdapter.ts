import type { StoredLead } from '../types';
import type { DeliveryAdapter, DeliveryResult } from './types';

/**
 * 3rd-party CRM/API adapter — for lead types pushed to an external system.
 */
export class CrmApiAdapter implements DeliveryAdapter {
  readonly name = 'crm-api';

  async send(lead: StoredLead): Promise<DeliveryResult> {
    const url = process.env.CRM_API_LEADS_URL;
    if (!url) {
      return { ok: true, destination: 'crm-api:demo' };
    }

    try {
      const res = await fetch(url, {
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
