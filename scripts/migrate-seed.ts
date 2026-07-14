import 'dotenv/config';
import pkg from 'pg';
import bcrypt from 'bcrypt';

// Disable TLS verification to handle Aiven PostgreSQL self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Client } = pkg;

// ⚠️ DEMO PASSWORDS — these only exist so the "quick login" buttons on the landing page
// keep working during development/demo. They match the buttons in LandingPage.tsx.
// BEFORE GOING LIVE: remove the quick-login buttons and change every account's password
// (e.g. via a proper "forgot password" / admin-managed reset flow) — do not ship this
// script's default passwords to a real production database.
const DEMO_PASSWORDS: Record<string, string> = {
  admin: 'admin123!Demo',
  guru: 'guru123!Demo',
  siswa: 'siswa123!Demo',
  wali: 'wali123!Demo',
};

// Use the same PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE vars as .env and api/db/pgClient.ts
// (previously this read DATABASE_URL, which doesn't exist in .env — this script never actually
// connected successfully before).
const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, DATABASE_URL } = process.env;

if (!DATABASE_URL && (!PGHOST || !PGPORT || !PGUSER || !PGPASSWORD || !PGDATABASE)) {
  console.error('❌ Env var database belum lengkap. Set PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE di .env (atau DATABASE_URL).');
  process.exit(1);
}

const client = DATABASE_URL
  ? new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : new Client({
      host: PGHOST,
      port: Number(PGPORT),
      user: PGUSER,
      password: PGPASSWORD,
      database: PGDATABASE,
      ssl: { rejectUnauthorized: false }, // Aiven requires SSL, this bypasses self-signed cert issues
    });

// Seed data corresponding directly to local storage definitions
const academicYears = [
  { id: 'ay-1', year: '2026/2027', semester: 'ganjil', is_active: true }
];

const users = [
  {
    id: 'u-admin',
    name: 'Admin SD Merdeka',
    email: 'admin@sekolah.sch.id',
    role: 'admin',
    phone: '081234567890',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    is_active: true,
    created_at: '2026-07-01T08:00:00Z',
    updated_at: '2026-07-01T08:00:00Z'
  },
  {
    id: 'u-teacher-1',
    name: 'Budi Santoso, S.Pd.',
    email: 'budi@sekolah.sch.id',
    role: 'guru',
    phone: '082345678901',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    is_active: true,
    created_at: '2026-07-01T08:00:00Z',
    updated_at: '2026-07-01T08:00:00Z'
  },
  {
    id: 'u-teacher-2',
    name: 'Siti Rahma, M.Pd.',
    email: 'siti@sekolah.sch.id',
    role: 'guru',
    phone: '083456789012',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    is_active: true,
    created_at: '2026-07-01T08:00:00Z',
    updated_at: '2026-07-01T08:00:00Z'
  },
  {
    id: 'u-student-1',
    name: 'Kiki Pratama',
    email: 'kiki@sekolah.sch.id',
    role: 'siswa',
    phone: '084567890123',
    avatar: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&q=80&w=200',
    is_active: true,
    created_at: '2026-07-01T08:00:00Z',
    updated_at: '2026-07-01T08:00:00Z'
  },
  {
    id: 'u-student-2',
    name: 'Rani Wijaya',
    email: 'rani@sekolah.sch.id',
    role: 'siswa',
    phone: '085678901234',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    is_active: true,
    created_at: '2026-07-01T08:00:00Z',
    updated_at: '2026-07-01T08:00:00Z'
  },
  {
    id: 'u-parent-1',
    name: 'Joko Pratama',
    email: 'joko@gmail.com',
    role: 'wali',
    phone: '086789012345',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    is_active: true,
    created_at: '2026-07-01T08:00:00Z',
    updated_at: '2026-07-01T08:00:00Z'
  },
  {
    id: 'u-parent-2',
    name: 'Anton Wijaya',
    email: 'anton@gmail.com',
    role: 'wali',
    phone: '087890123456',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    is_active: true,
    created_at: '2026-07-01T08:00:00Z',
    updated_at: '2026-07-01T08:00:00Z'
  }
];

const parents = [
  {
    id: 'p-1',
    user_id: 'u-parent-1',
    father_name: 'Joko Pratama',
    mother_name: 'Ambar Lestari',
    father_job: 'Wiraswasta',
    mother_job: 'Ibu Rumah Tangga',
    address: 'Jl. Pemuda No. 8, Suka Makmur',
    phone: '086789012345'
  },
  {
    id: 'p-2',
    user_id: 'u-parent-2',
    father_name: 'Anton Wijaya',
    mother_name: 'Rina Herawati',
    father_job: 'Pegawai Swasta',
    mother_job: 'Guru Paud',
    address: 'Jl. Kenanga No. 23, Suka Makmur',
    phone: '087890123456'
  }
];

const teachers = [
  {
    id: 't-1',
    user_id: 'u-teacher-1',
    nip: '198503122010121002',
    subject_specialization: 'Matematika, IPA',
    homeroom_class_id: 'c-1A',
    address: 'Jl. Merpati No. 12, Kota Baru'
  },
  {
    id: 't-2',
    user_id: 'u-teacher-2',
    nip: '198807242015042003',
    subject_specialization: 'Bahasa Indonesia, Seni Budaya',
    homeroom_class_id: 'c-2B',
    address: 'Jl. Melati Raya No. 45, Suka Maju'
  }
];

const classes = [
  {
    id: 'c-1A',
    name: '1A',
    grade_level: 1,
    homeroom_teacher_id: 't-1',
    academic_year_id: 'ay-1'
  },
  {
    id: 'c-2B',
    name: '2B',
    grade_level: 2,
    homeroom_teacher_id: 't-2',
    academic_year_id: 'ay-1'
  }
];

const students = [
  {
    id: 's-1',
    user_id: 'u-student-1',
    nis: '26001',
    nisn: '0152938102',
    class_id: 'c-1A',
    gender: 'L',
    birth_place: 'Jakarta',
    birth_date: '2019-05-12',
    address: 'Jl. Pemuda No. 8, Suka Makmur',
    parent_id: 'p-1',
    entry_year: 2026,
    status: 'aktif'
  },
  {
    id: 's-2',
    user_id: 'u-student-2',
    nis: '26002',
    nisn: '0153849103',
    class_id: 'c-1A',
    gender: 'P',
    birth_place: 'Bandung',
    birth_date: '2019-08-20',
    address: 'Jl. Kenanga No. 23, Suka Makmur',
    parent_id: 'p-2',
    entry_year: 2026,
    status: 'aktif'
  }
];

const subjects = [
  { id: 'sub-1', name: 'Matematika', code: 'MTK', grade_level: 1 },
  { id: 'sub-2', name: 'Bahasa Indonesia', code: 'IND', grade_level: 1 },
  { id: 'sub-3', name: 'Sains & IPA', code: 'IPA', grade_level: 1 },
  { id: 'sub-4', name: 'Seni Budaya', code: 'SBD', grade_level: 1 }
];

const schedules = [
  { id: 'sc-1', class_id: 'c-1A', subject_id: 'sub-1', teacher_id: 't-1', day: 'Senin', start_time: '07:30', end_time: '09:00' },
  { id: 'sc-2', class_id: 'c-1A', subject_id: 'sub-2', teacher_id: 't-2', day: 'Selasa', start_time: '07:30', end_time: '09:00' },
  { id: 'sc-3', class_id: 'c-1A', subject_id: 'sub-3', teacher_id: 't-1', day: 'Rabu', start_time: '07:30', end_time: '09:00' },
  { id: 'sc-4', class_id: 'c-1A', subject_id: 'sub-4', teacher_id: 't-2', day: 'Kamis', start_time: '09:30', end_time: '11:00' }
];

const grades = [
  { id: 'g-1', student_id: 's-1', subject_id: 'sub-1', teacher_id: 't-1', academic_year_id: 'ay-1', type: 'tugas', score: 90, notes: 'Kiki sangat baik dalam penjumlahan cepat.' },
  { id: 'g-2', student_id: 's-1', subject_id: 'sub-1', teacher_id: 't-1', academic_year_id: 'ay-1', type: 'uh', score: 85, notes: 'Pemahaman materi perkalian dasar bagus.' },
  { id: 'g-3', student_id: 's-1', subject_id: 'sub-1', teacher_id: 't-1', academic_year_id: 'ay-1', type: 'uts', score: 80, notes: 'Butuh ketelitian lebih pada soal cerita.' },
  { id: 'g-4', student_id: 's-2', subject_id: 'sub-1', teacher_id: 't-1', academic_year_id: 'ay-1', type: 'tugas', score: 95, notes: 'Sempurna, pekerjaan rapi dan sangat teliti.' },
  { id: 'g-5', student_id: 's-2', subject_id: 'sub-1', teacher_id: 't-1', academic_year_id: 'ay-1', type: 'uts', score: 92, notes: 'Hasil luar biasa.' }
];

const attendances = [
  { id: 'at-1', student_id: 's-1', date: '2026-07-06', status: 'hadir', notes: 'Hadir tepat waktu', recorded_by: 't-1' },
  { id: 'at-2', student_id: 's-2', date: '2026-07-06', status: 'hadir', notes: 'Hadir tepat waktu', recorded_by: 't-1' },
  { id: 'at-3', student_id: 's-1', date: '2026-07-07', status: 'hadir', notes: 'Hadir aktif', recorded_by: 't-1' },
  { id: 'at-4', student_id: 's-2', date: '2026-07-07', status: 'sakit', notes: 'Surat dokter: demam tinggi', recorded_by: 't-1' },
  { id: 'at-5', student_id: 's-1', date: '2026-07-08', status: 'hadir', notes: 'Hadir', recorded_by: 't-1' },
  { id: 'at-6', student_id: 's-2', date: '2026-07-08', status: 'hadir', notes: 'Sudah sehat kembali', recorded_by: 't-1' }
];

const assignments = [
  {
    id: 'as-1',
    class_id: 'c-1A',
    subject_id: 'sub-1',
    teacher_id: 't-1',
    title: 'PR Penjumlahan Gambar Mewarnai 📝',
    description: 'Hitung gambar bunga dan buah di lembar kerja yang diberikan, lalu warnai dengan rapi ya anak-anak! Kumpulkan hari senin depan.',
    file_url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=500',
    deadline: '2026-07-13 08:00',
    created_at: '2026-07-08T10:00:00Z'
  },
  {
    id: 'as-2',
    class_id: 'c-1A',
    subject_id: 'sub-2',
    teacher_id: 't-2',
    title: 'Membaca Dongeng Kancil & Buaya 🦊',
    description: 'Baca dongeng halaman 14 di buku paket Bahasa Indonesia. Tuliskan pesan moral dari cerita tersebut di buku tulis masing-masing!',
    deadline: '2026-07-14 08:00',
    created_at: '2026-07-08T11:30:00Z'
  }
];

const announcements = [
  {
    id: 'ann-1',
    title: 'Persiapan Lomba Semarak Kemerdekaan Lomba 17-an 🇮🇩',
    content: 'Dalam rangka memperingati HUT RI ke-81, SD Merdeka akan mengadakan berbagai perlombaan seru seperti lomba mewarnai, balap karung, dan menyanyi lagu nasional. Pendaftaran dapat dikoordinasikan dengan wali kelas masing-masing.',
    target_role: 'semua',
    image_url: 'https://images.unsplash.com/photo-1540317580114-ed6853f54243?auto=format&fit=crop&q=80&w=800',
    published_by: 'u-admin',
    published_at: '2026-07-07T09:00:00Z'
  },
  {
    id: 'ann-2',
    title: 'Pertemuan Rutin Komite Sekolah & Wali Murid Kelas 1',
    content: 'Undangan kepada seluruh wali murid kelas 1 untuk menghadiri sosialisasi program semester ganjil dan pengenalan kurikulum merdeka pada hari Sabtu, 11 Juli 2026 pukul 09.00 WIB di Aula Utama Sekolah.',
    target_role: 'wali',
    image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    published_by: 'u-admin',
    published_at: '2026-07-08T07:30:00Z'
  },
  {
    id: 'ann-3',
    title: 'Rapat Koordinasi Evaluasi Pembelajaran Guru',
    content: 'Dihimbau kepada seluruh bapak/ibu guru untuk menghadiri rapat mingguan evaluasi metode belajar interaktif anak kelas rendah pada hari Jumat, 10 Juli 2026 pukul 13.00 di Ruang Guru.',
    target_role: 'guru',
    published_by: 'u-admin',
    published_at: '2026-07-08T15:00:00Z'
  }
];

const gallery = [
  {
    id: 'gal-1',
    title: 'Hari Pertama Masuk Sekolah (MPLS)',
    image_url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&q=80&w=800',
    description: 'Siswa kelas 1 menyambut hari pertama masuk sekolah dengan penuh tawa dan balon warna-warni didampingi guru dan orang tua.',
    event_date: '2026-07-01'
  },
  {
    id: 'gal-2',
    title: 'Kegiatan Outbound Kebun Raya',
    image_url: 'https://images.unsplash.com/photo-1473643080040-61799b2e043b?auto=format&fit=crop&q=80&w=800',
    description: 'Pengenalan jenis-jenis tanaman herbal dan flora langka kepada siswa kelas 3 dan 4 secara langsung di alam terbuka.',
    event_date: '2026-05-20'
  },
  {
    id: 'gal-3',
    title: 'Lomba Paduan Suara Sekolah Dasar',
    image_url: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?auto=format&fit=crop&q=80&w=800',
    description: 'Tim paduan suara SD Merdeka berhasil memboyong piala juara kedua dalam festival seni pelajar tingkat provinsi.',
    event_date: '2026-06-14'
  }
];

const payments = [
  { id: 'pay-1', student_id: 's-1', month: 'Juli 2026', amount: 250000, status: 'lunas', paid_at: '2026-07-02T10:00:00Z' },
  { id: 'pay-2', student_id: 's-1', month: 'Agustus 2026', amount: 250000, status: 'belum_lunas' },
  { id: 'pay-3', student_id: 's-2', month: 'Juli 2026', amount: 250000, status: 'lunas', paid_at: '2026-07-03T11:15:00Z' },
  { id: 'pay-4', student_id: 's-2', month: 'Agustus 2026', amount: 250000, status: 'belum_lunas' }
];

async function migrateAndSeed() {
  try {
    console.log('🔄 Connecting to Aiven PostgreSQL Database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    console.log('🧹 Dropping existing tables for fresh migration...');
    await client.query(`
      DROP TABLE IF EXISTS submissions CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS attendances CASCADE;
      DROP TABLE IF EXISTS grades CASCADE;
      DROP TABLE IF EXISTS schedules CASCADE;
      DROP TABLE IF EXISTS assignments CASCADE;
      DROP TABLE IF EXISTS students CASCADE;
      DROP TABLE IF EXISTS classes CASCADE;
      DROP TABLE IF EXISTS teachers CASCADE;
      DROP TABLE IF EXISTS parents CASCADE;
      DROP TABLE IF EXISTS announcements CASCADE;
      DROP TABLE IF EXISTS sessions CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS subjects CASCADE;
      DROP TABLE IF EXISTS academic_years CASCADE;
      DROP TABLE IF EXISTS gallery CASCADE;
    `);

    console.log('🧱 Creating database schemas & tables...');

    // Academic Years
    await client.query(`
      CREATE TABLE academic_years (
        id VARCHAR(50) PRIMARY KEY,
        year VARCHAR(20) NOT NULL,
        semester VARCHAR(10) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT FALSE
      );
    `);

    // Users
    await client.query(`
      CREATE TABLE users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255),
        role VARCHAR(20) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        avatar TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Sessions (backs the login system in src/server/auth — works on Vercel serverless too,
    // since session state lives here in Postgres instead of in server memory)
    await client.query(`
      CREATE TABLE sessions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);
    await client.query(`CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);`);

    // Parents
    await client.query(`
      CREATE TABLE parents (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        father_name VARCHAR(100) NOT NULL,
        mother_name VARCHAR(100) NOT NULL,
        father_job VARCHAR(100) NOT NULL,
        mother_job VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(20) NOT NULL
      );
    `);

    // Teachers
    await client.query(`
      CREATE TABLE teachers (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        nip VARCHAR(50) NOT NULL,
        subject_specialization VARCHAR(255) NOT NULL,
        homeroom_class_id VARCHAR(50),
        address TEXT NOT NULL
      );
    `);

    // Classes
    await client.query(`
      CREATE TABLE classes (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(20) NOT NULL,
        grade_level INT NOT NULL,
        homeroom_teacher_id VARCHAR(50) REFERENCES teachers(id) ON DELETE SET NULL,
        academic_year_id VARCHAR(50) REFERENCES academic_years(id) ON DELETE CASCADE
      );
    `);

    // Students
    await client.query(`
      CREATE TABLE students (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        nis VARCHAR(50) UNIQUE NOT NULL,
        nisn VARCHAR(50) UNIQUE NOT NULL,
        class_id VARCHAR(50) REFERENCES classes(id) ON DELETE SET NULL,
        gender CHAR(1) NOT NULL,
        birth_place VARCHAR(100) NOT NULL,
        birth_date DATE NOT NULL,
        address TEXT NOT NULL,
        parent_id VARCHAR(50) REFERENCES parents(id) ON DELETE SET NULL,
        entry_year INT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'aktif'
      );
    `);

    // Subjects
    await client.query(`
      CREATE TABLE subjects (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) NOT NULL,
        grade_level INT NOT NULL
      );
    `);

    // Schedules
    await client.query(`
      CREATE TABLE schedules (
        id VARCHAR(50) PRIMARY KEY,
        class_id VARCHAR(50) REFERENCES classes(id) ON DELETE CASCADE,
        subject_id VARCHAR(50) REFERENCES subjects(id) ON DELETE CASCADE,
        teacher_id VARCHAR(50) REFERENCES teachers(id) ON DELETE CASCADE,
        day VARCHAR(20) NOT NULL,
        start_time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL
      );
    `);

    // Grades
    await client.query(`
      CREATE TABLE grades (
        id VARCHAR(50) PRIMARY KEY,
        student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
        subject_id VARCHAR(50) REFERENCES subjects(id) ON DELETE CASCADE,
        teacher_id VARCHAR(50) REFERENCES teachers(id) ON DELETE CASCADE,
        academic_year_id VARCHAR(50) REFERENCES academic_years(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL,
        score INT NOT NULL,
        notes TEXT NOT NULL
      );
    `);

    // Attendances
    await client.query(`
      CREATE TABLE attendances (
        id VARCHAR(50) PRIMARY KEY,
        student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        status VARCHAR(20) NOT NULL,
        notes TEXT NOT NULL,
        recorded_by VARCHAR(50) NOT NULL
      );
    `);

    // Assignments
    await client.query(`
      CREATE TABLE assignments (
        id VARCHAR(50) PRIMARY KEY,
        class_id VARCHAR(50) REFERENCES classes(id) ON DELETE CASCADE,
        subject_id VARCHAR(50) REFERENCES subjects(id) ON DELETE CASCADE,
        teacher_id VARCHAR(50) REFERENCES teachers(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        file_url TEXT,
        file_name VARCHAR(255),
        deadline VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Submissions
    await client.query(`
      CREATE TABLE submissions (
        id VARCHAR(50) PRIMARY KEY,
        assignment_id VARCHAR(50) REFERENCES assignments(id) ON DELETE CASCADE,
        student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
        student_name VARCHAR(100) NOT NULL,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        file_name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        score INT,
        notes TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'dikirim'
      );
    `);

    // Announcements
    await client.query(`
      CREATE TABLE announcements (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        target_role VARCHAR(20) NOT NULL DEFAULT 'semua',
        image_url TEXT,
        published_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Gallery
    await client.query(`
      CREATE TABLE gallery (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_url TEXT NOT NULL,
        description TEXT NOT NULL,
        event_date DATE NOT NULL
      );
    `);

    // Payments
    await client.query(`
      CREATE TABLE payments (
        id VARCHAR(50) PRIMARY KEY,
        student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
        month VARCHAR(50) NOT NULL,
        amount INT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'belum_lunas',
        paid_at TIMESTAMP WITH TIME ZONE,
        proof_file_name VARCHAR(255),
        proof_file_url TEXT
      );
    `);

    console.log('✅ Tables created successfully!');

    console.log('🌱 Seeding database with initial data...');

    // Seed Academic Years
    for (const ay of academicYears) {
      await client.query(
        'INSERT INTO academic_years (id, year, semester, is_active) VALUES ($1, $2, $3, $4)',
        [ay.id, ay.year, ay.semester, ay.is_active]
      );
    }

    // Seed Users
    for (const u of users) {
      const plainPassword = DEMO_PASSWORDS[u.role] || 'ganti123!Demo';
      const passwordHash = await bcrypt.hash(plainPassword, 10);
      await client.query(
        'INSERT INTO users (id, name, email, password, role, phone, avatar, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [u.id, u.name, u.email, passwordHash, u.role, u.phone, u.avatar, u.is_active, u.created_at, u.updated_at]
      );
    }

    // Seed Parents
    for (const p of parents) {
      await client.query(
        'INSERT INTO parents (id, user_id, father_name, mother_name, father_job, mother_job, address, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [p.id, p.user_id, p.father_name, p.mother_name, p.father_job, p.mother_job, p.address, p.phone]
      );
    }

    // Seed Teachers
    for (const t of teachers) {
      await client.query(
        'INSERT INTO teachers (id, user_id, nip, subject_specialization, homeroom_class_id, address) VALUES ($1, $2, $3, $4, $5, $6)',
        [t.id, t.user_id, t.nip, t.subject_specialization, t.homeroom_class_id, t.address]
      );
    }

    // Seed Classes
    for (const c of classes) {
      await client.query(
        'INSERT INTO classes (id, name, grade_level, homeroom_teacher_id, academic_year_id) VALUES ($1, $2, $3, $4, $5)',
        [c.id, c.name, c.grade_level, c.homeroom_teacher_id, c.academic_year_id]
      );
    }

    // Seed Students
    for (const s of students) {
      await client.query(
        'INSERT INTO students (id, user_id, nis, nisn, class_id, gender, birth_place, birth_date, address, parent_id, entry_year, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        [s.id, s.user_id, s.nis, s.nisn, s.class_id, s.gender, s.birth_place, s.birth_date, s.address, s.parent_id, s.entry_year, s.status]
      );
    }

    // Seed Subjects
    for (const sub of subjects) {
      await client.query(
        'INSERT INTO subjects (id, name, code, grade_level) VALUES ($1, $2, $3, $4)',
        [sub.id, sub.name, sub.code, sub.grade_level]
      );
    }

    // Seed Schedules
    for (const sc of schedules) {
      await client.query(
        'INSERT INTO schedules (id, class_id, subject_id, teacher_id, day, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [sc.id, sc.class_id, sc.subject_id, sc.teacher_id, sc.day, sc.start_time, sc.end_time]
      );
    }

    // Seed Grades
    for (const g of grades) {
      await client.query(
        'INSERT INTO grades (id, student_id, subject_id, teacher_id, academic_year_id, type, score, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [g.id, g.student_id, g.subject_id, g.teacher_id, g.academic_year_id, g.type, g.score, g.notes]
      );
    }

    // Seed Attendances
    for (const at of attendances) {
      await client.query(
        'INSERT INTO attendances (id, student_id, date, status, notes, recorded_by) VALUES ($1, $2, $3, $4, $5, $6)',
        [at.id, at.student_id, at.date, at.status, at.notes, at.recorded_by]
      );
    }

    // Seed Assignments
    for (const as of assignments) {
      await client.query(
        'INSERT INTO assignments (id, class_id, subject_id, teacher_id, title, description, file_url, deadline, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [as.id, as.class_id, as.subject_id, as.teacher_id, as.title, as.description, as.file_url, as.deadline, as.created_at]
      );
    }

    // Seed Announcements
    for (const ann of announcements) {
      await client.query(
        'INSERT INTO announcements (id, title, content, target_role, image_url, published_by, published_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [ann.id, ann.title, ann.content, ann.target_role, ann.image_url, ann.published_by, ann.published_at]
      );
    }

    // Seed Gallery
    for (const gal of gallery) {
      await client.query(
        'INSERT INTO gallery (id, title, image_url, description, event_date) VALUES ($1, $2, $3, $4, $5)',
        [gal.id, gal.title, gal.image_url, gal.description, gal.event_date]
      );
    }

    // Seed Payments
    for (const pay of payments) {
      await client.query(
        'INSERT INTO payments (id, student_id, month, amount, status, paid_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [pay.id, pay.student_id, pay.month, pay.amount, pay.status, pay.paid_at]
      );
    }

    console.log('✅ Seeding completed successfully!');
    console.log('🚀 Aiven PostgreSQL database is now ready for use!');
    console.log('');
    console.log('🔑 Demo login credentials (matches the quick-login buttons on the landing page):');
    console.log('   admin@sekolah.sch.id  /', DEMO_PASSWORDS.admin);
    console.log('   budi@sekolah.sch.id   /', DEMO_PASSWORDS.guru);
    console.log('   kiki@sekolah.sch.id   /', DEMO_PASSWORDS.siswa);
    console.log('   joko@gmail.com        /', DEMO_PASSWORDS.wali);
    console.log('⚠️  These are DEMO passwords only. Remove the quick-login buttons and change');
    console.log('    every password before this goes live with real student/parent data.');

  } catch (error) {
    console.error('❌ Error during migration & seeding:', error);
  } finally {
    await client.end();
  }
}

migrateAndSeed();
