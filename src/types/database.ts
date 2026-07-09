/**
 * Database Types conforming to the SD Elementary School specification
 */

export type UserRole = 'admin' | 'guru' | 'siswa' | 'wali';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // encrypted or clear for simulation
  role: UserRole;
  phone: string;
  avatar: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  user_id: string; // FK to users
  nis: string;
  nisn: string;
  class_id: string; // FK to classes
  gender: 'L' | 'P';
  birth_place: string;
  birth_date: string;
  address: string;
  parent_id: string; // FK to parents
  entry_year: number;
  status: 'aktif' | 'lulus' | 'pindah' | 'keluar';
}

export interface Parent {
  id: string;
  user_id: string; // FK to users
  father_name: string;
  mother_name: string;
  father_job: string;
  mother_job: string;
  address: string;
  phone: string; // emergency contact
}

export interface Teacher {
  id: string;
  user_id: string; // FK to users
  nip: string;
  subject_specialization: string;
  homeroom_class_id: string | null; // FK to classes
  address: string;
}

export interface SchoolClass {
  id: string;
  name: string; // "1A", "6B", etc.
  grade_level: number; // 1 to 6
  homeroom_teacher_id: string; // FK to teachers
  academic_year_id: string; // FK to academic_years
}

export interface AcademicYear {
  id: string;
  year: string; // "2026/2027"
  semester: 'ganjil' | 'genap';
  is_active: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  grade_level: number;
}

export interface Schedule {
  id: string;
  class_id: string; // FK to classes
  subject_id: string; // FK to subjects
  teacher_id: string; // FK to teachers
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  start_time: string; // "07:00"
  end_time: string; // "08:30"
}

export interface Grade {
  id: string;
  student_id: string; // FK to students
  subject_id: string; // FK to subjects
  teacher_id: string; // FK to teachers
  academic_year_id: string; // FK to academic_years
  type: 'tugas' | 'uh' | 'uts' | 'uas';
  score: number;
  notes: string;
}

export interface Attendance {
  id: string;
  student_id: string; // FK to students
  date: string; // "YYYY-MM-DD"
  status: 'hadir' | 'sakit' | 'izin' | 'alpha';
  notes: string;
  recorded_by: string; // FK to teachers (user_id or teacher_id)
}

export interface Assignment {
  id: string;
  class_id: string; // FK to classes
  subject_id: string; // FK to subjects
  teacher_id: string; // FK to teachers
  title: string;
  description: string;
  file_url?: string;
  file_name?: string; // added to store name of teacher's uploaded guide/pdf
  deadline: string; // YYYY-MM-DD HH:mm
  created_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string; // FK to assignments
  student_id: string; // FK to students
  student_name: string;
  submitted_at: string;
  file_name: string;
  file_url: string; // Base64 or local blob string
  score?: number;
  notes?: string;
  status: 'dikirim' | 'dinilai';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target_role: 'semua' | 'guru' | 'siswa' | 'wali';
  image_url?: string;
  published_by: string; // FK to users
  published_at: string;
}

export interface Gallery {
  id: string;
  title: string;
  image_url: string;
  description: string;
  event_date: string;
}

export interface Payment {
  id: string;
  student_id: string; // FK to students
  month: string; // e.g. "Juli 2026", "Agustus 2026"
  amount: number;
  status: 'lunas' | 'belum_lunas' | 'proses_verifikasi';
  paid_at?: string;
  proof_file_name?: string;
  proof_file_url?: string; // Base64 or local mock file url
}
