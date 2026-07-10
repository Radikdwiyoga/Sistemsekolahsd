import { Pool } from 'pg';

const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;

if (!PGHOST || !PGPORT || !PGUSER || !PGPASSWORD || !PGDATABASE) {
  throw new Error(
    'Environment variables database belum lengkap. Pastikan PGHOST, PGPORT, PGUSER, PGPASSWORD, dan PGDATABASE sudah diset.'
  );
}

// Gunakan global supaya tidak membuat pool baru setiap function invocation
// (penting untuk lingkungan serverless seperti Vercel)
declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

const pool =
  global.pgPool ||
  new Pool({
    host: PGHOST,
    port: Number(PGPORT),
    user: PGUSER,
    password: PGPASSWORD,
    database: PGDATABASE,
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== 'production') {
  global.pgPool = pool;
}

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

export default pool;