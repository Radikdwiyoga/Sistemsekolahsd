import type { VercelRequest, VercelResponse } from '@vercel/node';
import pkg from 'pg';

const { Pool } = pkg as any;

type AnyReq = VercelRequest & { body?: any };


function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Missing DATABASE_URL');
  }

  return new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

export default async function handler(req: AnyReq, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { table, data } = (req.body || {}) as { table?: string; data?: any[] };
  if (!table || !Array.isArray(data)) {
    return res.status(400).json({ error: 'Invalid payload: table name and data array are required.' });
  }

  const tableMapping: Record<string, string> = {
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
    sd_merdeka_submissions: 'submissions',
  };

  const dbTable = tableMapping[table];
  if (!dbTable) {
    return res.status(400).json({ error: `Unknown database table mapping for: ${table}` });
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Upsert rows
    for (const row of data) {
      const keys = Object.keys(row).filter((k) => row[k] !== undefined);
      const values = keys.map((k) => row[k]);
      const valuePlaceholders = keys.map((_, i) => `$${i + 1}`).join(', ');

      const updateClause = keys
        .filter((k) => k !== 'id')
        .map((k) => `${k} = EXCLUDED.${k}`)
        .join(', ');

      const queryText = `
        INSERT INTO ${dbTable} (${keys.join(', ')})
        VALUES (${valuePlaceholders})
        ON CONFLICT (id)
        DO UPDATE SET ${updateClause || 'id = EXCLUDED.id'}
      `;

      await client.query(queryText, values);
    }

    // Delete rows not present in incoming payload
    if (data.length > 0) {
      const ids = data.map((r) => r.id);
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
      await client.query(`DELETE FROM ${dbTable} WHERE id NOT IN (${placeholders})`, ids);
    } else {
      await client.query(`DELETE FROM ${dbTable}`);
    }

    await client.query('COMMIT');
    res.status(200).json({ success: true });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error(`Transaction failed on table ${dbTable}:`, error);
    res.status(500).json({ error: 'Transaction rollback triggered', details: error?.message });
  } finally {
    client.release();
  }
}

