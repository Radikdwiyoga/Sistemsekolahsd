import crypto from 'crypto';
import pool from '../../../api/db/pgClient.js';
import type { User } from './authStore.js';

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function createSession(userId: string): Promise<{ sessionId: string; expiresAt: Date }> {
  const sessionId = crypto.randomBytes(32).toString('hex'); // 256 bits, unguessable
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await pool.query(
    'INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES ($1, $2, NOW(), $3)',
    [sessionId, userId, expiresAt]
  );

  return { sessionId, expiresAt };
}

export async function getUserBySession(sessionId: string | undefined): Promise<User | null> {
  if (!sessionId) return null;

  const result = await pool.query(
    `SELECT u.id, u.email, u.name, u.role, u.phone, u.avatar, u.is_active, u.created_at, u.updated_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = $1 AND s.expires_at > NOW() AND u.is_active = true
     LIMIT 1`,
    [sessionId]
  );

  if (result.rows.length === 0) return null;
  return result.rows[0] as User;
}

export async function deleteSession(sessionId: string | undefined): Promise<void> {
  if (!sessionId) return;
  await pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
}
