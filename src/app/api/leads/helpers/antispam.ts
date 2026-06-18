/**
 * Verify a Cloudflare Turnstile token server-side.
 *
 * If TURNSTILE_SECRET_KEY is unset the challenge is skipped in development
 * (local dev / demo), but fails closed in production — a missing secret there
 * is a misconfiguration, not a reason to wave traffic through.
 */
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV !== 'production';

  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.append('remoteip', ip);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });

    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
