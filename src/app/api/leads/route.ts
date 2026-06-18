import { NextRequest, NextResponse } from 'next/server';
import { leadRequestSchema } from '@/lib/leadSchema';
import { handleLead } from '@/lib/handleLead';
import { rateLimit } from '@/lib/rateLimit';
import { verifyTurnstile } from '@/lib/antispam';

// Node runtime: the lead pipeline uses node:fs / node:crypto.
export const runtime = 'nodejs';

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || 'unknown';
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  // 1) Rate limit per IP (anti-spam / abuse).
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'retry-after': String(limit.retryAfter) } },
    );
  }

  // 2) Parse + validate. Honeypot lives in the schema (company_website must be empty).
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

  // 3) Verify anti-spam token.
  const human = await verifyTurnstile(parsed.data.turnstileToken, ip);
  if (!human) {
    return NextResponse.json({ error: 'Spam check failed' }, { status: 403 });
  }

  // 4) Run the pipeline. Strip transport-only fields before handing to handler.
  const { turnstileToken, company_website, ...lead } = parsed.data;
  try {
    const result = await handleLead(lead);
    // 202: accepted + durably stored, even if downstream delivery is retrying.
    return NextResponse.json({ id: result.id, status: result.deliveryStatus }, { status: 202 });
  } catch (err) {
    // Never leak internals to the client; log server-side for diagnostics.
    console.error('lead handler error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
