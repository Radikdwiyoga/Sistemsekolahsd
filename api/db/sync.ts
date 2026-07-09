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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pool = getPool();

    const tables = [
      { key: 'sd_merdeka_users', name: 'users' },
      { key: 'sd_merdeka_students', name: 'students' },
      { key: 'sd_merdeka_parents', name: 'parents' },
      { key: 'sd_merdeka_teachers', name: 'teachers' },
      { key: 'sd_merdeka_classes', name: 'classes' },
      { key: 'sd_merdeka_academic_years', name: 'academic_years' },
      { key: 'sd_merdeka_subjects', name: 'subjects' },
      { key: 'sd_merdeka_schedules', name: 'schedules' },
      { key: 'sd_merdeka_grades', name: 'grades' },
      { key: 'sd_merdeka_attendances', name: 'attendances' },
      { key: 'sd_merdeka_assignments', name: 'assignments' },
      { key: 'sd_merdeka_announcements', name: 'announcements' },
      { key: 'sd_merdeka_gallery', name: 'gallery' },
      { key: 'sd_merdeka_payments', name: 'payments' },
      { key: 'sd_merdeka_submissions', name: 'submissions' },
    ];

    const payload: Record<string, any[]> = {};

    for (const table of tables) {
      const result = await pool.query(`SELECT * FROM ${table.name}`);
      payload[table.key] = result.rows;
    }

    res.status(200).json(payload);
  } catch (error: any) {
    console.error('Database synchronization failed:', error);
    res.status(500).json({ error: 'Database synchronization failed', details: error?.message });
  }
}

