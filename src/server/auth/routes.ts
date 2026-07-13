import type { Request, Response } from 'express';
import express from 'express';
import { verifyUserCredentials } from './authStore.js';

interface RequestWithSession extends Request {
  session: any;
}

const router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
  const sessionReq = req as RequestWithSession;
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email dan password wajib diisi' });
  }

  const user = await verifyUserCredentials(String(email), String(password));
  if (!user) {
    return res.status(401).json({ error: 'Email atau password salah / akun non-aktif.' });
  }

  // prevent session fixation: regenerate
  sessionReq.session.regenerate((err: any) => {
    if (err) {
      return res.status(500).json({ error: 'Gagal membuat session.' });
    }

    sessionReq.session.user = user;
    return res.json({ success: true, user });
  });
});

router.post('/logout', (req: Request, res: Response) => {
  const sessionReq = req as RequestWithSession;
  sessionReq.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

router.get('/me', (req: Request, res: Response) => {
  const sessionReq = req as RequestWithSession;
  if (!sessionReq.session.user) return res.status(200).json({ user: null });
  return res.status(200).json({ user: sessionReq.session.user });
});

export const authRoutes = router;

