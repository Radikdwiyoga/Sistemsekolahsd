import query from '../../../api/db/pgClient.js';
import bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'guru' | 'siswa' | 'wali';
  phone: string;
  avatar: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Verify user credentials against database
 * @param email User email
 * @param password Plain text password
 * @returns User object if valid credentials, null otherwise
 */
export async function verifyUserCredentials(email: string, password: string): Promise<User | null> {
  try {
    // NOTE: column names must match the actual schema created in scripts/migrate-seed.ts
    // (id VARCHAR, is_active BOOLEAN, password VARCHAR -> stores a bcrypt hash, not plaintext)
    const result = await query.query(
      'SELECT id, email, name, role, phone, avatar, is_active, created_at, updated_at, password FROM users WHERE email = $1 AND is_active = true LIMIT 1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];

    // Account has no password set yet (e.g. freshly seeded/migrated) — reject login instead of crashing.
    if (!user.password) {
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return null;
    }

    // Return user without password hash
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  } catch (error) {
    console.error('Error verifying user credentials:', error);
    return null;
  }
}