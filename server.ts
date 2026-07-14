import 'dotenv/config';
import express from 'express';
import path from 'path';
import pkg from 'pg';
import { createServer as createViteServer } from 'vite';
import { loginHandler, logoutHandler, meHandler } from './src/server/auth/index.js';

// Disable TLS verification to handle Aiven PostgreSQL self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = pkg;

const PORT = Number(process.env.PORT) || 3000;
const app = express();

// Initialize PG Connection Pool for Aiven
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Aiven PostgreSQL connections
  }
});

app.use(express.json({ limit: '50mb' })); // support large payloads for Base64 proof images

// Auth (mirrors api/auth/*.ts so local dev behaves the same as the Vercel deployment)
app.post('/api/auth/login', loginHandler);
app.post('/api/auth/logout', logoutHandler);
app.get('/api/auth/me', meHandler);

// API 1: Sync cache on load
app.get('/api/db/sync', async (req, res) => {
  try {
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
      { key: 'sd_merdeka_submissions', name: 'submissions' }
    ];

    const payload: Record<string, any[]> = {};

    for (const table of tables) {
      // Never ship the password hash to the client.
      const columns = table.name === 'users'
        ? 'id, name, email, role, phone, avatar, is_active, created_at, updated_at'
        : '*';
      const result = await pool.query(`SELECT ${columns} FROM ${table.name}`);
      payload[table.key] = result.rows;
    }

    res.json(payload);
  } catch (error: any) {
    console.error('❌ Synchronize database failed:', error);
    res.status(500).json({ error: 'Database synchronization failed', details: error.message });
  }
});

// API 2: Update database state (Universal Transactional Upsert + Sync Deletions)
app.post('/api/db/update', async (req: any, res: any) => {
  const { table, data } = req.body;
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
    sd_merdeka_submissions: 'submissions'
  };

  const dbTable = tableMapping[table];
  if (!dbTable) {
    return res.status(400).json({ error: `Unknown database table mapping for: ${table}` });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Process Insert & Updates (Upsert)
    for (const row of data) {
      const keys = Object.keys(row).filter(k => row[k] !== undefined);
      const values = keys.map(k => row[k]);
      const valuePlaceholders = keys.map((_, i) => `$${i + 1}`).join(', ');

      const updateClause = keys
        .filter(k => k !== 'id')
        .map((k, idx) => `${k} = EXCLUDED.${k}`)
        .join(', ');

      const queryText = `
        INSERT INTO ${dbTable} (${keys.join(', ')})
        VALUES (${valuePlaceholders})
        ON CONFLICT (id) 
        DO UPDATE SET ${updateClause || 'id = EXCLUDED.id'}
      `;

      await client.query(queryText, values);
    }

    // 2. Process Deletions (remove rows present in DB but deleted in client)
    if (data.length > 0) {
      const ids = data.map(r => r.id);
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
      await client.query(`DELETE FROM ${dbTable} WHERE id NOT IN (${placeholders})`, ids);
    } else {
      await client.query(`DELETE FROM ${dbTable}`);
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error(`❌ Transaction failed on table ${dbTable}:`, error);
    res.status(500).json({ error: 'Transaction rollback triggered', details: error.message });
  } finally {
    client.release();
  }
});

// Configure Vite middleware in development or serve static build in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SD Merdeka Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
