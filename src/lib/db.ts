import { 
  User, Student, Parent, Teacher, SchoolClass, AcademicYear, 
  Subject, Schedule, Grade, Attendance, Assignment, Announcement, 
  Gallery, Payment, Submission 
} from '../types/database';

// LocalStorage Keys
const KEYS = {
  USERS: 'sd_merdeka_users',
  STUDENTS: 'sd_merdeka_students',
  PARENTS: 'sd_merdeka_parents',
  TEACHERS: 'sd_merdeka_teachers',
  CLASSES: 'sd_merdeka_classes',
  ACADEMIC_YEARS: 'sd_merdeka_academic_years',
  SUBJECTS: 'sd_merdeka_subjects',
  SCHEDULES: 'sd_merdeka_schedules',
  GRADES: 'sd_merdeka_grades',
  ATTENDANCES: 'sd_merdeka_attendances',
  ASSIGNMENTS: 'sd_merdeka_assignments',
  ANNOUNCEMENTS: 'sd_merdeka_announcements',
  GALLERY: 'sd_merdeka_gallery',
  PAYMENTS: 'sd_merdeka_payments',
  SUBMISSIONS: 'sd_merdeka_submissions',
};

// Seed Data
const initialAcademicYears: AcademicYear[] = [
  { id: 'ay-1', year: '2026/2027', semester: 'ganjil', is_active: true }
];

const initialUsers: User[] = [
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

const initialTeachers: Teacher[] = [
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

const initialClasses: SchoolClass[] = [
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

const initialParents: Parent[] = [
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

const initialStudents: Student[] = [
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

const initialSubjects: Subject[] = [
  { id: 'sub-1', name: 'Matematika', code: 'MTK', grade_level: 1 },
  { id: 'sub-2', name: 'Bahasa Indonesia', code: 'IND', grade_level: 1 },
  { id: 'sub-3', name: 'Sains & IPA', code: 'IPA', grade_level: 1 },
  { id: 'sub-4', name: 'Seni Budaya', code: 'SBD', grade_level: 1 }
];

const initialSchedules: Schedule[] = [
  {
    id: 'sc-1',
    class_id: 'c-1A',
    subject_id: 'sub-1',
    teacher_id: 't-1',
    day: 'Senin',
    start_time: '07:30',
    end_time: '09:00'
  },
  {
    id: 'sc-2',
    class_id: 'c-1A',
    subject_id: 'sub-2',
    teacher_id: 't-2',
    day: 'Selasa',
    start_time: '07:30',
    end_time: '09:00'
  },
  {
    id: 'sc-3',
    class_id: 'c-1A',
    subject_id: 'sub-3',
    teacher_id: 't-1',
    day: 'Rabu',
    start_time: '07:30',
    end_time: '09:00'
  },
  {
    id: 'sc-4',
    class_id: 'c-1A',
    subject_id: 'sub-4',
    teacher_id: 't-2',
    day: 'Kamis',
    start_time: '09:30',
    end_time: '11:00'
  }
];

const initialGrades: Grade[] = [
  {
    id: 'g-1',
    student_id: 's-1',
    subject_id: 'sub-1',
    teacher_id: 't-1',
    academic_year_id: 'ay-1',
    type: 'tugas',
    score: 90,
    notes: 'Kiki sangat baik dalam penjumlahan cepat.'
  },
  {
    id: 'g-2',
    student_id: 's-1',
    subject_id: 'sub-1',
    teacher_id: 't-1',
    academic_year_id: 'ay-1',
    type: 'uh',
    score: 85,
    notes: 'Pemahaman materi perkalian dasar bagus.'
  },
  {
    id: 'g-3',
    student_id: 's-1',
    subject_id: 'sub-1',
    teacher_id: 't-1',
    academic_year_id: 'ay-1',
    type: 'uts',
    score: 80,
    notes: 'Butuh ketelitian lebih pada soal cerita.'
  },
  {
    id: 'g-4',
    student_id: 's-2',
    subject_id: 'sub-1',
    teacher_id: 't-1',
    academic_year_id: 'ay-1',
    type: 'tugas',
    score: 95,
    notes: 'Sempurna, pekerjaan rapi dan sangat teliti.'
  },
  {
    id: 'g-5',
    student_id: 's-2',
    subject_id: 'sub-1',
    teacher_id: 't-1',
    academic_year_id: 'ay-1',
    type: 'uts',
    score: 92,
    notes: 'Hasil luar biasa.'
  }
];

const initialAttendances: Attendance[] = [
  {
    id: 'at-1',
    student_id: 's-1',
    date: '2026-07-06',
    status: 'hadir',
    notes: 'Hadir tepat waktu',
    recorded_by: 't-1'
  },
  {
    id: 'at-2',
    student_id: 's-2',
    date: '2026-07-06',
    status: 'hadir',
    notes: 'Hadir tepat waktu',
    recorded_by: 't-1'
  },
  {
    id: 'at-3',
    student_id: 's-1',
    date: '2026-07-07',
    status: 'hadir',
    notes: 'Hadir aktif',
    recorded_by: 't-1'
  },
  {
    id: 'at-4',
    student_id: 's-2',
    date: '2026-07-07',
    status: 'sakit',
    notes: 'Surat dokter: demam tinggi',
    recorded_by: 't-1'
  },
  {
    id: 'at-5',
    student_id: 's-1',
    date: '2026-07-08',
    status: 'hadir',
    notes: 'Hadir',
    recorded_by: 't-1'
  },
  {
    id: 'at-6',
    student_id: 's-2',
    date: '2026-07-08',
    status: 'hadir',
    notes: 'Sudah sehat kembali',
    recorded_by: 't-1'
  }
];

const initialAssignments: Assignment[] = [
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

const initialAnnouncements: Announcement[] = [
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

const initialGallery: Gallery[] = [
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

const initialPayments: Payment[] = [
  { id: 'pay-1', student_id: 's-1', month: 'Juli 2026', amount: 250000, status: 'lunas', paid_at: '2026-07-02T10:00:00Z' },
  { id: 'pay-2', student_id: 's-1', month: 'Agustus 2026', amount: 250000, status: 'belum_lunas' },
  { id: 'pay-3', student_id: 's-2', month: 'Juli 2026', amount: 250000, status: 'lunas', paid_at: '2026-07-03T11:15:00Z' },
  { id: 'pay-4', student_id: 's-2', month: 'Agustus 2026', amount: 250000, status: 'belum_lunas' }
];

// Memory Cache for Client-Side Dual Mode (Local / Real-API Proxy)
const cache: Record<string, any> = {};

// Helper to check if real database API should be used
const shouldUseAPI = (): boolean => {
  return (import.meta as any).env?.VITE_USE_API === 'true' || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production');
};

// Global initializer to load data from PostgreSQL backend if API mode is active
let initializedPromise: Promise<void> | null = null;

export const initializeDatabase = async (): Promise<void> => {
  if (!shouldUseAPI()) return Promise.resolve();
  if (initializedPromise) return initializedPromise;

  initializedPromise = (async () => {
    try {
      console.log('🔄 SD Merdeka: Synchronizing cache with Aiven PostgreSQL Database...');
      const response = await fetch('/api/db/sync');
      if (response.ok) {
        const payload = await response.json();
        Object.keys(payload).forEach(key => {
          cache[key] = payload[key];
        });
        console.log('✅ SD Merdeka: Cache synchronized successfully!');
      } else {
        console.warn('⚠️ SD Merdeka API sync failed. Falling back to local storage.');
      }
    } catch (e) {
      console.error('❌ SD Merdeka database sync error:', e);
    }
  })();

  return initializedPromise;
};

// Automatically initiate sync in production / API mode
if (shouldUseAPI()) {
  initializeDatabase();
}

// Database Engine implementation
export class LocalDB {
  private static load<T>(key: string, initial: T[]): T[] {
    if (shouldUseAPI()) {
      // Return from synchronized cache if loaded, otherwise fall back to initial
      if (cache[key]) return cache[key];
      cache[key] = initial;
      return initial;
    }

    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  private static save<T>(key: string, data: T[]): void {
    if (shouldUseAPI()) {
      cache[key] = data;
      // Asynchronously send update to database endpoint
      fetch('/api/db/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: key, data })
      }).catch(err => console.error('Error updating production database table:', key, err));
      return;
    }

    localStorage.setItem(key, JSON.stringify(data));
  }

  // Getters
  static getUsers(): User[] { return this.load(KEYS.USERS, initialUsers); }
  static getStudents(): Student[] { return this.load(KEYS.STUDENTS, initialStudents); }
  static getParents(): Parent[] { return this.load(KEYS.PARENTS, initialParents); }
  static getTeachers(): Teacher[] { return this.load(KEYS.TEACHERS, initialTeachers); }
  static getClasses(): SchoolClass[] { return this.load(KEYS.CLASSES, initialClasses); }
  static getAcademicYears(): AcademicYear[] { return this.load(KEYS.ACADEMIC_YEARS, initialAcademicYears); }
  static getSubjects(): Subject[] { return this.load(KEYS.SUBJECTS, initialSubjects); }
  static getSchedules(): Schedule[] { return this.load(KEYS.SCHEDULES, initialSchedules); }
  static getGrades(): Grade[] { return this.load(KEYS.GRADES, initialGrades); }
  static getAttendances(): Attendance[] { return this.load(KEYS.ATTENDANCES, initialAttendances); }
  static getAssignments(): Assignment[] { return this.load(KEYS.ASSIGNMENTS, initialAssignments); }
  static getAnnouncements(): Announcement[] { return this.load(KEYS.ANNOUNCEMENTS, initialAnnouncements); }
  static getGallery(): Gallery[] { return this.load(KEYS.GALLERY, initialGallery); }
  static getPayments(): Payment[] { return this.load(KEYS.PAYMENTS, initialPayments); }
  static getSubmissions(): Submission[] { return this.load(KEYS.SUBMISSIONS, []); }

  // Setters/CRUD Operations
  static setUsers(data: User[]) { this.save(KEYS.USERS, data); }
  static setStudents(data: Student[]) { this.save(KEYS.STUDENTS, data); }
  static setParents(data: Parent[]) { this.save(KEYS.PARENTS, data); }
  static setTeachers(data: Teacher[]) { this.save(KEYS.TEACHERS, data); }
  static setClasses(data: SchoolClass[]) { this.save(KEYS.CLASSES, data); }
  static setAcademicYears(data: AcademicYear[]) { this.save(KEYS.ACADEMIC_YEARS, data); }
  static setSubjects(data: Subject[]) { this.save(KEYS.SUBJECTS, data); }
  static setSchedules(data: Schedule[]) { this.save(KEYS.SCHEDULES, data); }
  static setGrades(data: Grade[]) { this.save(KEYS.GRADES, data); }
  static setAttendances(data: Attendance[]) { this.save(KEYS.ATTENDANCES, data); }
  static setAssignments(data: Assignment[]) { this.save(KEYS.ASSIGNMENTS, data); }
  static setAnnouncements(data: Announcement[]) { this.save(KEYS.ANNOUNCEMENTS, data); }
  static setGallery(data: Gallery[]) { this.save(KEYS.GALLERY, data); }
  static setPayments(data: Payment[]) { this.save(KEYS.PAYMENTS, data); }
  static setSubmissions(data: Submission[]) { this.save(KEYS.SUBMISSIONS, data); }

  // Specific Entity Helpers
  static addStudentWithUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>, student: Omit<Student, 'id' | 'user_id'>, parentName?: string) {
    const userId = 'u-' + Math.random().toString(36).substr(2, 9);
    const studentId = 's-' + Math.random().toString(36).substr(2, 9);
    
    const newUser: User = {
      ...user,
      id: userId,
      role: 'siswa',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newStudent: Student = {
      ...student,
      id: studentId,
      user_id: userId,
    };

    const users = this.getUsers();
    users.push(newUser);
    this.setUsers(users);

    const students = this.getStudents();
    students.push(newStudent);
    this.setStudents(students);

    // Create default payment
    const payments = this.getPayments();
    payments.push({
      id: 'pay-' + Math.random().toString(36).substr(2, 9),
      student_id: studentId,
      month: 'Juli 2026',
      amount: 250000,
      status: 'belum_lunas'
    });
    this.setPayments(payments);

    return { user: newUser, student: newStudent };
  }

  static addTeacherWithUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>, teacher: Omit<Teacher, 'id' | 'user_id'>) {
    const userId = 'u-' + Math.random().toString(36).substr(2, 9);
    const teacherId = 't-' + Math.random().toString(36).substr(2, 9);

    const newUser: User = {
      ...user,
      id: userId,
      role: 'guru',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newTeacher: Teacher = {
      ...teacher,
      id: teacherId,
      user_id: userId
    };

    const users = this.getUsers();
    users.push(newUser);
    this.setUsers(users);

    const teachers = this.getTeachers();
    teachers.push(newTeacher);
    this.setTeachers(teachers);

    return { user: newUser, teacher: newTeacher };
  }

  static addParentWithUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>, parent: Omit<Parent, 'id' | 'user_id'>) {
    const userId = 'u-' + Math.random().toString(36).substr(2, 9);
    const parentId = 'p-' + Math.random().toString(36).substr(2, 9);

    const newUser: User = {
      ...user,
      id: userId,
      role: 'wali',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newParent: Parent = {
      ...parent,
      id: parentId,
      user_id: userId
    };

    const users = this.getUsers();
    users.push(newUser);
    this.setUsers(users);

    const parents = this.getParents();
    parents.push(newParent);
    this.setParents(parents);

    return { user: newUser, parent: newParent };
  }
}
