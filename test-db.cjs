const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'PASTE_DATABASE_URL_ANDA_DISINI',
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Koneksi GAGAL:', err.message);
  } else {
    console.log('✅ Koneksi BERHASIL:', res.rows[0]);
  }
  pool.end();
});