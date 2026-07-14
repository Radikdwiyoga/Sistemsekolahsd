import type { VercelRequest, VercelResponse } from '@vercel/node';
import { loginHandler } from '../../src/server/auth/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return loginHandler(req as any, res as any);
}
