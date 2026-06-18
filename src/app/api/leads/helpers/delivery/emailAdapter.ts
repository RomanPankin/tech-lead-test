import type { StoredLead } from '../types';
import type { DeliveryAdapter, DeliveryResult } from './types';

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
