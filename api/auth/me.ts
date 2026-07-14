import type { VercelRequest, VercelResponse } from '@vercel/node';
import { meHandler } from '../../src/server/auth/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return meHandler(req as any, res as any);
}
