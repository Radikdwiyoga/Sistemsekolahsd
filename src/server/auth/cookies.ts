// Minimal cookie helpers so auth works identically whether the request comes through
// server.ts (Express, local dev / non-Vercel hosting) or api/auth/*.ts (Vercel serverless).
// Deliberately dependency-free to avoid relying on Express-specific req/res extensions.

export const SESSION_COOKIE_NAME = 'sid';

export function parseCookies(cookieHeader?: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(value);
    } catch {
      out[key] = value;
    }
  }
  return out;
}

export function serializeSessionCookie(sessionId: string, maxAgeSeconds: number): string {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  // Secure requires HTTPS — Vercel production is always HTTPS, local dev over http is not.
  if (isProd) parts.push('Secure');
  return parts.join('; ');
}

export function clearSessionCookie(): string {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isProd) parts.push('Secure');
  return parts.join('; ');
}
