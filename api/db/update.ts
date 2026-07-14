import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './pgClient.js';

// Peta nama key localStorage (dari src/lib/db.ts) ke nama tabel PostgreSQL
// SESUAIKAN nama tabel di kanan dengan nama tabel asli di database Aiven Anda
const TABLE_MAP: Record<string, string> = {
  sd_merdeka_users: 'users',
  sd_merdeka_students: 'students',
  sd_merdeka_parents: 'parents',
  sd_merdeka_teachers: 'teachers',
  sd_merdeka_classes: 'classes',
  sd_merdeka_academic_years: 'academic_years',
  sd_merdeka_subjects: 'subjects',
  sd_merdeka_schedules: 'schedules',
  sd_merdeka_grades: 'grades',
  sd_merdeka_attendances: 'attendances',
  sd_merdeka_assignments: 'assignments',
  sd_merdeka_announcements: 'announcements',
  sd_merdeka_gallery: 'gallery',
  sd_merdeka_payments: 'payments',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { table, data } = req.body;
  const tableName = TABLE_MAP[table];

  if (!tableName) {
    return res.status(400).json({ error: `Tabel tidak dikenali: ${table}` });
  }

  const client = await pool.connect();

  try {
    // Safety net: refuse to blindly wipe a table that currently has rows if the client
    // sent an empty array. A legit "delete everything" action is extremely rare from this
    // app's UI — an empty payload here is far more likely a stale/uninitialized client cache.
    if (!Array.isArray(data) || data.length === 0) {
      const existing = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
      const existingCount = Number(existing.rows[0].count);
      if (existingCount > 0) {
        client.release();
        return res.status(409).json({
          error: `Ditolak: percobaan mengosongkan tabel "${tableName}" yang saat ini berisi ${existingCount} baris, ` +
                 `dari payload kosong. Ini biasanya berarti klien belum selesai sinkronisasi — coba muat ulang halaman.`,
        });
      }
    }

    // Strategi sederhana: kosongkan tabel, lalu insert ulang semua data.
    // Cocok untuk data berskala kecil (sekolah SD). Untuk data besar,
    // sebaiknya diganti dengan UPSERT per baris (ON CONFLICT DO UPDATE).
    await client.query('BEGIN');
    await client.query(`DELETE FROM ${tableName}`);

    if (Array.isArray(data) && data.length > 0) {
      const columns = Object.keys(data[0]);

      for (const row of data) {
        const rowValues = columns.map((col) => row[col]);
        const placeholders = rowValues.map((_, i) => `$${i + 1}`).join(', ');
        await client.query(
          `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`,
          rowValues
        );
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ status: 'success', table: tableName, rows: data.length });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Update error:', error);
    res.status(500).json({
      error: 'Database update failed',
      details: error.message,
    });
  } finally {
    client.release();
  }
}