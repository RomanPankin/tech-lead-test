import { NextRequest, NextResponse } from 'next/server';
import { leadRequestSchema } from '@/lib/leadSchema';
import { processLead } from './helpers/processLead';
import { rateLimit } from './helpers/rateLimit';
import { verifyTurnstile } from './helpers/antispam';
import { detectCountry } from './helpers/geo';
import { clientIp } from './helpers/clientIp';

// Node runtime: the lead pipeline uses node:fs / node:crypto.
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  // rate limit per IP (anti-spam / abuse).
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'retry-after': String(limit.retryAfter) } },
    );
  }

  // rarse + validate the user-supplied fields.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = leadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // verify anti-spam token.
  const human = await verifyTurnstile(parsed.data.turnstileToken, ip);
  if (!human) {
    return NextResponse.json({ error: 'Spam check failed' }, { status: 403 });
  }

  // run the pipeline. Country of origin is derived server-side from geo-IP
  // (never client input); transport-only fields are stripped first.
  const { turnstileToken, ...lead } = parsed.data;
  const country = detectCountry(req.headers);

  try {
    const result = await processLead(lead, country);

    // 202: accepted + durably stored, even if downstream delivery is retrying.
    return NextResponse.json({ id: result.id, status: result.deliveryStatus }, { status: 202 });
  } catch (err) {
    // Never leak internals to the client; log server-side for diagnostics.
    console.error('lead handler error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
