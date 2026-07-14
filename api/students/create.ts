import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../db/pgClient.js';
import { getRequestUser } from '../../src/server/auth/index.js';

/**
 * Creates a student, its login user, its parent, the parent's login user, and a default
 * payment row — all in ONE database transaction. This replaces the previous approach of
 * sending 4 separate /api/db/update calls (one per table), which had no atomicity: if any
 * later step failed, earlier steps had already committed, leaving orphaned "ghost" rows
 * (e.g. a user account with no matching student) that then blocked retries with the same
 * email/NIS.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const requester = await getRequestUser(req as any);
  if (!requester || requester.role !== 'admin') {
    return res.status(401).json({ error: 'Harus login sebagai admin untuk menambah siswa.' });
  }

  const { studentUser, student, parentUser, parent, payment } = req.body || {};
  if (!studentUser || !student || !parentUser || !parent) {
    return res.status(400).json({ error: 'Data tidak lengkap.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO users (id, name, email, password, role, phone, avatar, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'wali', $5, $6, $7, $8, $9)`,
      [parentUser.id, parentUser.name, parentUser.email, parentUser.password, parentUser.phone,
       parentUser.avatar, parentUser.is_active, parentUser.created_at, parentUser.updated_at]
    );

    await client.query(
      `INSERT INTO parents (id, user_id, father_name, mother_name, father_job, mother_job, address, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [parent.id, parentUser.id, parent.father_name, parent.mother_name, parent.father_job,
       parent.mother_job, parent.address, parent.phone]
    );

    await client.query(
      `INSERT INTO users (id, name, email, password, role, phone, avatar, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'siswa', $5, $6, $7, $8, $9)`,
      [studentUser.id, studentUser.name, studentUser.email, studentUser.password, studentUser.phone,
       studentUser.avatar, studentUser.is_active, studentUser.created_at, studentUser.updated_at]
    );

    await client.query(
      `INSERT INTO students (id, user_id, nis, nisn, class_id, gender, birth_place, birth_date, address, parent_id, entry_year, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [student.id, studentUser.id, student.nis, student.nisn, student.class_id, student.gender,
       student.birth_place, student.birth_date, student.address, parent.id, student.entry_year, student.status]
    );

    if (payment) {
      await client.query(
        `INSERT INTO payments (id, student_id, month, amount, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [payment.id, student.id, payment.month, payment.amount, payment.status]
      );
    }

    await client.query('COMMIT');
    return res.status(200).json({ success: true, studentId: student.id, parentId: parent.id });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('❌ Gagal membuat siswa (transaksi dibatalkan penuh):', error);
    return res.status(400).json({ error: error.message || 'Gagal menyimpan data siswa.' });
  } finally {
    client.release();
  }
}
