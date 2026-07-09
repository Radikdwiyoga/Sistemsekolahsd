import { Pool } from 'pg';

const caCert = process.env.DATABASE_CA_CERT;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL tidak ditemukan di environment variables');
}
if (!caCert) {
  throw new Error('DATABASE_CA_CERT tidak ditemukan di environment variables');
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
    connectionString,
    ssl: {
      ca: caCert,
      rejectUnauthorized: true,
    },
  });

if (process.env.NODE_ENV !== 'production') {
  global.pgPool = pool;
}

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

export default pool;