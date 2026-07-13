import query from '../../../api/db/pgClient.js';
import bcrypt from 'bcrypt';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'parent' | 'student';
  active: boolean;
}

/**
 * Verify user credentials against database
 * @param email User email
 * @param password Plain text password
 * @returns User object if valid credentials, null otherwise
 */
export async function verifyUserCredentials(email: string, password: string): Promise<User | null> {
  try {
    const result = await query.query(
      'SELECT id, email, name, role, active, password_hash FROM users WHERE email = $1 AND active = true LIMIT 1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return null;
    }

    // Return user without password hash
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active
    };
  } catch (error) {
    console.error('Error verifying user credentials:', error);
    return null;
  }
}