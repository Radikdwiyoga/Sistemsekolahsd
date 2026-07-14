import { verifyUserCredentials } from './authStore.js';
import { createSession, deleteSession, getUserBySession, SESSION_TTL_SECONDS } from './sessionStore.js';
import { parseCookies, serializeSessionCookie, clearSessionCookie, SESSION_COOKIE_NAME } from './cookies.js';

// Minimal shape shared by Express's (req, res) and Vercel's (VercelRequest, VercelResponse) —
// both are compatible with this subset, so the same handler works unmodified in either runtime.
interface MinimalRequest {
  method?: string;
  body?: any;
  headers: Record<string, string | string[] | undefined>;
}
interface MinimalResponse {
  status: (code: number) => MinimalResponse;
  json: (body: any) => any;
  setHeader: (name: string, value: string) => any;
}

export async function loginHandler(req: MinimalRequest, res: MinimalResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi.' });
  }

  const user = await verifyUserCredentials(String(email), String(password));
  if (!user) {
    return res.status(401).json({ error: 'Email atau password salah, atau akun non-aktif.' });
  }

  const { sessionId } = await createSession(user.id);
  res.setHeader('Set-Cookie', serializeSessionCookie(sessionId, SESSION_TTL_SECONDS));
  return res.status(200).json({ success: true, user });
}

export async function logoutHandler(req: MinimalRequest, res: MinimalResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parseCookies(req.headers.cookie as string | undefined);
  await deleteSession(cookies[SESSION_COOKIE_NAME]);
  res.setHeader('Set-Cookie', clearSessionCookie());
  return res.status(200).json({ success: true });
}

export async function meHandler(req: MinimalRequest, res: MinimalResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parseCookies(req.headers.cookie as string | undefined);
  const user = await getUserBySession(cookies[SESSION_COOKIE_NAME]);
  return res.status(200).json({ user });
}

/**
 * Helper for protecting other endpoints (e.g. /api/db/sync, /api/db/update).
 * Returns the logged-in user, or null if there isn't one — caller decides how to respond.
 */
export async function getRequestUser(req: MinimalRequest) {
  const cookies = parseCookies(req.headers.cookie as string | undefined);
  return getUserBySession(cookies[SESSION_COOKIE_NAME]);
}
