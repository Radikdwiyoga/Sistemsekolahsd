import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, UserCheck, BookOpen, Megaphone, LogOut, Search, Plus, 
  Trash2, Edit, ChevronLeft, ChevronRight, Download, Filter, 
  CheckCircle, ShieldAlert, GraduationCap, Calendar, Clock, Save, X, Upload,
  DollarSign, Check
} from 'lucide-react';
import { LocalDB } from '../lib/db';
import { User, Student, Teacher, SchoolClass, Announcement, Parent, Payment } from '../types/database';

interface AdminDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

type ActiveTab = 'dashboard' | 'siswa' | 'guru' | 'kelas' | 'pengumuman' | 'pembayaran';

export default function AdminDashboard({ currentUser, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // DB State
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // State for face upload
  const [formStudentAvatar, setFormStudentAvatar] = useState('');
  const [studentAvatarName, setStudentAvatarName] = useState('');

  // States for login credentials
  const [formStudentPassword, setFormStudentPassword] = useState('siswa');
  const [formParentEmail, setFormParentEmail] = useState('');
  const [formParentPassword, setFormParentPassword] = useState('wali');

  // State for payments management
  const [paymentMonth, setPaymentMonth] = useState('September 2026');
  const [paymentAmount, setPaymentAmount] = useState(250000);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('semua');
  const [filterGender, setFilterGender] = useState('semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'siswa' | 'guru' | 'kelas' | 'pengumuman'>('siswa');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNis, setFormNis] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formClassId, setFormClassId] = useState('');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formBirthPlace, setFormBirthPlace] = useState('');
  const [formBirthDate, setFormBirthDate] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formParentFather, setFormParentFather] = useState('');
  const [formParentMother, setFormParentMother] = useState('');
  const [formParentJob, setFormParentJob] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formSpecialization, setFormSpecialization] = useState('');
  const [formClassName, setFormClassName] = useState('');
  const [formGradeLevel, setFormGradeLevel] = useState(1);
  const [formHomeroomTeacher, setFormHomeroomTeacher] = useState('');
  const [formAnnTitle, setFormAnnTitle] = useState('');
  const [formAnnContent, setFormAnnContent] = useState('');
  const [formAnnTarget, setFormAnnTarget] = useState<'semua' | 'guru' | 'siswa' | 'wali'>('semua');
  const [formAnnImage, setFormAnnImage] = useState('');
  const [formAnnImageName, setFormAnnImageName] = useState('');

  // Notification Banner
  const [toastMessage, setToastMessage] = useState('');

  // Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<any[]>([]);
  const [importError, setImportError] = useState('');

  const handleDownloadTemplate = () => {
    const headers = 'NIS,NISN,Nama Lengkap,Email,No Telepon,Gender (L/P),Tempat Lahir,Tanggal Lahir (YYYY-MM-DD),Alamat,Nama Ayah,Nama Ibu,Pekerjaan Ayah,ID Kelas\n';
    const row1 = '26003,0154859201,Budi Pekerti,budi.pekerti@sekolah.sch.id,081298765432,L,Jakarta,2019-03-15,Jl. Mawar No. 10,Agus Pekerti,Siti Pekerti,Wiraswasta,c-1A\n';
    const row2 = '26004,0154859202,Aura Cantika,aura.cantika@sekolah.sch.id,081298765433,P,Bandung,2019-05-20,Jl. Melati No. 5,Wawan,Siti,Pegawai Negeri,c-1A\n';
    
    const content = headers + row1 + row2;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_import_siswa_sd_merdeka.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Template CSV berhasil diunduh!');
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split('\n');
        const parsed: any[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length < 13) continue;

          parsed.push({
            nis: cols[0],
            nisn: cols[1],
            name: cols[2],
            email: cols[3],
            phone: cols[4],
            gender: cols[5],
            birthPlace: cols[6],
            birthDate: cols[7],
            address: cols[8],
            fatherName: cols[9],
            motherName: cols[10],
            fatherJob: cols[11],
            classId: cols[12]
          });
        }

        if (parsed.length === 0) {
          setImportError('Tidak ada data siswa valid ditemukan dalam file CSV.');
          setImportPreviewData([]);
        } else {
          setImportPreviewData(parsed);
          setImportError('');
        }
      } catch (err) {
        setImportError('Gagal membaca file CSV. Pastikan format sesuai template.');
        setImportPreviewData([]);
      }
    };
    reader.readAsText(file);
  };

  const handleStudentAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/jpg')) {
      alert('Hanya diperbolehkan file gambar JPEG atau PNG!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormStudentAvatar(event.target?.result as string);
      setStudentAvatarName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleAnnImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/jpg') && !file.type.match('image/gif')) {
      alert('Hanya diperbolehkan file gambar JPEG, PNG, atau GIF!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormAnnImage(event.target?.result as string);
      setFormAnnImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateBulkPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMonth) {
      alert('Pilih bulan tagihan!');
      return;
    }

    const currentStudents = LocalDB.getStudents();
    if (currentStudents.length === 0) {
      alert('Tidak ada siswa terdaftar untuk diberi tagihan!');
      return;
    }

    const currentPayments = LocalDB.getPayments();
    let count = 0;
    currentStudents.forEach(stud => {
      const exists = currentPayments.some(p => p.student_id === stud.id && p.month.toLowerCase() === paymentMonth.toLowerCase());
      if (!exists) {
        currentPayments.push({
          id: 'pay-' + Math.random().toString(36).substr(2, 9),
          student_id: stud.id,
          month: paymentMonth,
          amount: Number(paymentAmount) || 250000,
          status: 'belum_lunas'
        });
        count++;
      }
    });

    LocalDB.setPayments(currentPayments);
    refreshData();
    showToast(`Berhasil menerbitkan ${count} tagihan SPP ${paymentMonth}!`);
  };

  const handleConfirmPaymentStatus = (paymentId: string, status: 'lunas' | 'belum_lunas' | 'proses_verifikasi') => {
    const currentPayments = LocalDB.getPayments();
    const updated = currentPayments.map(p => {
      if (p.id === paymentId) {
        return { ...p, status };
      }
      return p;
    });
    LocalDB.setPayments(updated);
    refreshData();
    showToast(`Status pembayaran berhasil diperbarui menjadi ${status.toUpperCase()}!`);
  };

  const handleExecuteImport = () => {
    if (importPreviewData.length === 0) return;

    let localUsers = [...LocalDB.getUsers()];
    let localStudents = [...LocalDB.getStudents()];
    let localParents = [...LocalDB.getParents()];
    let localPayments = [...LocalDB.getPayments()];

    let importedCount = 0;
    let skippedCount = 0;

    importPreviewData.forEach(item => {
      const emailExists = localUsers.some(u => u.email.toLowerCase() === item.email.toLowerCase());
      if (emailExists) {
        skippedCount++;
        return;
      }

      const userId = 'u-' + Math.random().toString(36).substr(2, 9);
      const studentId = 's-' + Math.random().toString(36).substr(2, 9);
      const parentId = 'p-' + Math.random().toString(36).substr(2, 9);
      const parentUserId = 'u-' + Math.random().toString(36).substr(2, 9);

      const newStudentUser: User = {
        id: userId,
        name: item.name,
        email: item.email,
        role: 'siswa',
        phone: item.phone,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(item.name)}`,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const newStudent: Student = {
        id: studentId,
        user_id: userId,
        nis: item.nis,
        nisn: item.nisn,
        class_id: item.classId,
        gender: item.gender === 'P' ? 'P' : 'L',
        birth_place: item.birthPlace || 'Jakarta',
        birth_date: item.birthDate || '2019-01-01',
        address: item.address || 'Alamat Sekolah',
        parent_id: parentId,
        entry_year: 2026,
        status: 'aktif'
      };

      const newParentUser: User = {
        id: parentUserId,
        name: item.fatherName || `Orang Tua ${item.name}`,
        email: `${item.nis}@wali.merdeka.id`,
        role: 'wali',
        phone: item.phone,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const newParent: Parent = {
        id: parentId,
        user_id: parentUserId,
        father_name: item.fatherName || '-',
        mother_name: item.motherName || '-',
        father_job: item.fatherJob || '-',
        mother_job: 'Ibu Rumah Tangga',
        address: item.address || '-',
        phone: item.phone
      };

      localUsers.push(newStudentUser, newParentUser);
      localStudents.push(newStudent);
      localParents.push(newParent);

      localPayments.push({
        id: 'pay-' + Math.random().toString(36).substr(2, 9),
        student_id: studentId,
        month: 'Juli 2026',
        amount: 250000,
        status: 'belum_lunas'
      });

      importedCount++;
    });

    LocalDB.setUsers(localUsers);
    LocalDB.setStudents(localStudents);
    LocalDB.setParents(localParents);
    LocalDB.setPayments(localPayments);

    refreshData();
    setIsImportModalOpen(false);
    setImportPreviewData([]);
    
    let msg = `Berhasil mengimpor ${importedCount} data siswa!`;
    if (skippedCount > 0) {
      msg += ` (${skippedCount} email sudah terdaftar & dilewati)`;
    }
    showToast(msg);
  };

  // Load Data
  const refreshData = () => {
    setUsers(LocalDB.getUsers());
    setStudents(LocalDB.getStudents());
    setTeachers(LocalDB.getTeachers());
    setClasses(LocalDB.getClasses());
    setParents(LocalDB.getParents());
    setAnnouncements(LocalDB.getAnnouncements());
    setPayments(LocalDB.getPayments());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Delete Helpers
  const handleDeleteUser = (userId: string, role: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    // Filter users
    const updatedUsers = users.filter(u => u.id !== userId);
    LocalDB.setUsers(updatedUsers);

    if (role === 'siswa') {
      const updatedStudents = students.filter(s => s.user_id !== userId);
      LocalDB.setStudents(updatedStudents);
    } else if (role === 'guru') {
      const updatedTeachers = teachers.filter(t => t.user_id !== userId);
      LocalDB.setTeachers(updatedTeachers);
    }

    refreshData();
    showToast('Data berhasil dihapus dari database.');
  };

  const handleDeleteClass = (classId: string) => {
    if (!window.confirm('Hapus kelas ini? Siswa yang terhubung mungkin perlu dipindahkan.')) return;
    const updated = classes.filter(c => c.id !== classId);
    LocalDB.setClasses(updated);
    refreshData();
    showToast('Kelas berhasil dihapus.');
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (!window.confirm('Hapus pengumuman ini?')) return;
    const updated = announcements.filter(a => a.id !== id);
    LocalDB.setAnnouncements(updated);
    refreshData();
    showToast('Pengumuman berhasil dihapus.');
  };

  // Open Modal Helper for Insert/Update
  const openAddModal = (type: 'siswa' | 'guru' | 'kelas' | 'pengumuman') => {
    setModalType(type);
    setEditingId(null);
    setIsModalOpen(true);

    // Reset Forms
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormNis('');
    setFormNisn('');
    setFormClassId(classes[0]?.id || '');
    setFormGender('L');
    setFormBirthPlace('Jakarta');
    setFormBirthDate('2019-01-01');
    setFormAddress('');
    setFormParentFather('');
    setFormParentMother('');
    setFormParentJob('');
    setFormNip('');
    setFormSpecialization('');
    setFormClassName('');
    setFormGradeLevel(1);
    setFormHomeroomTeacher(teachers[0]?.id || '');
    setFormAnnTitle('');
    setFormAnnContent('');
    setFormAnnTarget('semua');
    setFormAnnImage('');
    setFormAnnImageName('');

    // Reset Credentials & Face Upload
    setFormStudentPassword('siswa');
    setFormParentEmail('');
    setFormParentPassword('wali');
    setFormStudentAvatar('');
    setStudentAvatarName('');
  };

  const openEditModal = (type: 'siswa' | 'guru' | 'kelas' | 'pengumuman', id: string) => {
    setModalType(type);
    setEditingId(id);
    setIsModalOpen(true);

    if (type === 'siswa') {
      const stud = students.find(s => s.id === id);
      const u = users.find(usr => usr.id === stud?.user_id);
      const prnt = parents.find(p => p.id === stud?.parent_id);
      const prntUser = prnt ? users.find(usr => usr.id === prnt.user_id) : null;
      if (stud && u) {
        setFormName(u.name);
        setFormEmail(u.email);
        setFormPhone(u.phone);
        setFormNis(stud.nis);
        setFormNisn(stud.nisn);
        setFormClassId(stud.class_id);
        setFormGender(stud.gender);
        setFormBirthPlace(stud.birth_place);
        setFormBirthDate(stud.birth_date);
        setFormAddress(stud.address);
        setFormParentFather(prnt?.father_name || '');
        setFormParentMother(prnt?.mother_name || '');
        setFormParentJob(prnt?.father_job || '');

        // Load credentials and avatar
        setFormStudentPassword(u.password || 'siswa');
        setFormParentEmail(prntUser?.email || `${stud.nis}@wali.merdeka.id`);
        setFormParentPassword(prntUser?.password || 'wali');
        setFormStudentAvatar(u.avatar || '');
        setStudentAvatarName(u.avatar ? 'Foto Wajah Terunggah' : '');
      }
    } else if (type === 'guru') {
      const teach = teachers.find(t => t.id === id);
      const u = users.find(usr => usr.id === teach?.user_id);
      if (teach && u) {
        setFormName(u.name);
        setFormEmail(u.email);
        setFormPhone(u.phone);
        setFormNip(teach.nip);
        setFormSpecialization(teach.subject_specialization);
        setFormAddress(teach.address);
      }
    } else if (type === 'kelas') {
      const cls = classes.find(c => c.id === id);
      if (cls) {
        setFormClassName(cls.name);
        setFormGradeLevel(cls.grade_level);
        setFormHomeroomTeacher(cls.homeroom_teacher_id);
      }
    } else if (type === 'pengumuman') {
      const ann = announcements.find(a => a.id === id);
      if (ann) {
        setFormAnnTitle(ann.title);
        setFormAnnContent(ann.content);
        setFormAnnTarget(ann.target_role);
        setFormAnnImage(ann.image_url || '');
        setFormAnnImageName(ann.image_url ? 'Gambar Terunggah' : '');
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalType === 'siswa') {
      if (editingId) {
        // Edit Mode
        const studIdx = students.findIndex(s => s.id === editingId);
        if (studIdx !== -1) {
          const stud = students[studIdx];
          // Update User
          const updatedUsers = users.map(u => {
            if (u.id === stud.user_id) {
              return { 
                ...u, 
                name: formName, 
                email: formEmail, 
                phone: formPhone, 
                avatar: formStudentAvatar || u.avatar,
                password: formStudentPassword || u.password,
                updated_at: new Date().toISOString() 
              };
            }
            return u;
          });

          // Update Parent User (if any)
          const updatedUsersAll = updatedUsers.map(u => {
            const prnt = parents.find(p => p.id === stud.parent_id);
            if (prnt && u.id === prnt.user_id) {
              return {
                ...u,
                email: formParentEmail || u.email,
                password: formParentPassword || u.password,
                updated_at: new Date().toISOString()
              };
            }
            return u;
          });
          LocalDB.setUsers(updatedUsersAll);

          // Update Student
          const updatedStudents = [...students];
          updatedStudents[studIdx] = {
            ...stud,
            nis: formNis,
            nisn: formNisn,
            class_id: formClassId,
            gender: formGender,
            birth_place: formBirthPlace,
            birth_date: formBirthDate,
            address: formAddress,
          };
          LocalDB.setStudents(updatedStudents);

          // Update Parent
          const updatedParents = parents.map(p => {
            if (p.id === stud.parent_id) {
              return { 
                ...p, 
                father_name: formParentFather, 
                mother_name: formParentMother, 
                father_job: formParentJob, 
                address: formAddress 
              };
            }
            return p;
          });
          LocalDB.setParents(updatedParents);
          
          showToast('Data siswa berhasil diperbarui!');
        }
      } else {
        // Create Mode
        // 1. Create Parent First
        const parentId = 'p-' + Math.random().toString(36).substr(2, 9);
        const parentUserId = 'u-' + Math.random().toString(36).substr(2, 9);
        const newParentUser: User = {
          id: parentUserId,
          name: formParentFather || 'Orang Tua Siswa',
          email: formParentEmail || `${formNis}@wali.merdeka.id`,
          password: formParentPassword,
          role: 'wali',
          phone: formPhone,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const newParent: Parent = {
          id: parentId,
          user_id: parentUserId,
          father_name: formParentFather,
          mother_name: formParentMother,
          father_job: formParentJob,
          mother_job: 'Ibu Rumah Tangga',
          address: formAddress,
          phone: formPhone
        };

        // 2. Create Student with user
        const { user: newStudentUser, student: newStudent } = LocalDB.getUsers().find(u => u.email === formEmail) 
          ? { user: null, student: null } 
          : LocalDB.addStudentWithUser(
              {
                name: formName,
                email: formEmail,
                password: formStudentPassword,
                role: 'siswa',
                phone: formPhone,
                avatar: formStudentAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${formName}`,
                is_active: true
              },
              {
                nis: formNis,
                nisn: formNisn,
                class_id: formClassId,
                gender: formGender,
                birth_place: formBirthPlace,
                birth_date: formBirthDate,
                address: formAddress,
                parent_id: parentId,
                entry_year: 2026,
                status: 'aktif'
              }
            );

        if (!newStudent) {
          alert('Email siswa sudah terdaftar!');
          return;
        }

        // Save Parent data
        const currentParents = LocalDB.getParents();
        currentParents.push(newParent);
        LocalDB.setParents(currentParents);

        const currentUsers = LocalDB.getUsers();
        currentUsers.push(newParentUser);
        LocalDB.setUsers(currentUsers);

        showToast('Data siswa & Orang tua beserta user login berhasil ditambahkan!');
      }
    } else if (modalType === 'guru') {
      if (editingId) {
        const teachIdx = teachers.findIndex(t => t.id === editingId);
        if (teachIdx !== -1) {
          const teach = teachers[teachIdx];
          const updatedUsers = users.map(u => {
            if (u.id === teach.user_id) {
              return { ...u, name: formName, email: formEmail, phone: formPhone, updated_at: new Date().toISOString() };
            }
            return u;
          });
          LocalDB.setUsers(updatedUsers);

          const updatedTeachers = [...teachers];
          updatedTeachers[teachIdx] = {
            ...teach,
            nip: formNip,
            subject_specialization: formSpecialization,
            address: formAddress
          };
          LocalDB.setTeachers(updatedTeachers);
          showToast('Data guru berhasil diperbarui!');
        }
      } else {
        const { teacher } = LocalDB.addTeacherWithUser(
          {
            name: formName,
            email: formEmail,
            role: 'guru',
            phone: formPhone,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formName}`,
            is_active: true
          },
          {
            nip: formNip,
            subject_specialization: formSpecialization,
            homeroom_class_id: null,
            address: formAddress
          }
        );
        showToast('Guru baru berhasil ditambahkan!');
      }
    } else if (modalType === 'kelas') {
      if (editingId) {
        const updated = classes.map(c => {
          if (c.id === editingId) {
            return {
              ...c,
              name: formClassName,
              grade_level: formGradeLevel,
              homeroom_teacher_id: formHomeroomTeacher
            };
          }
          return c;
        });
        LocalDB.setClasses(updated);
        showToast('Kelas berhasil diperbarui!');
      } else {
        const newClass: SchoolClass = {
          id: 'c-' + formClassName,
          name: formClassName,
          grade_level: formGradeLevel,
          homeroom_teacher_id: formHomeroomTeacher,
          academic_year_id: 'ay-1'
        };
        const currentClasses = LocalDB.getClasses();
        currentClasses.push(newClass);
        LocalDB.setClasses(currentClasses);
        showToast('Kelas baru berhasil ditambahkan!');
      }
    } else if (modalType === 'pengumuman') {
      if (editingId) {
        const updated = announcements.map(a => {
          if (a.id === editingId) {
            return {
              ...a,
              title: formAnnTitle,
              content: formAnnContent,
              target_role: formAnnTarget,
              image_url: formAnnImage || undefined,
            };
          }
          return a;
        });
        LocalDB.setAnnouncements(updated);
        showToast('Pengumuman diperbarui!');
      } else {
        const newAnn: Announcement = {
          id: 'ann-' + Math.random().toString(36).substr(2, 9),
          title: formAnnTitle,
          content: formAnnContent,
          target_role: formAnnTarget,
          image_url: formAnnImage || undefined,
          published_by: currentUser.id,
          published_at: new Date().toISOString()
        };
        const current = LocalDB.getAnnouncements();
        current.unshift(newAnn);
        LocalDB.setAnnouncements(current);
        showToast('Pengumuman baru berhasil diterbitkan!');
      }
    }

    setIsModalOpen(false);
    refreshData();
  };

  // CSV Exporter Simulation
  const handleExportData = (type: string) => {
    let content = 'ID,Nama,Email,No Telepon\n';
    if (type === 'siswa') {
      students.forEach(s => {
        const u = users.find(usr => usr.id === s.user_id);
        content += `${s.nis},"${u?.name}",${u?.email},${u?.phone}\n`;
      });
    } else {
      teachers.forEach(t => {
        const u = users.find(usr => usr.id === t.user_id);
        content += `${t.nip},"${u?.name}",${u?.email},${u?.phone}\n`;
      });
    }
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `data_${type}_sd_merdeka.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`File CSV ${type} berhasil diekspor!`);
  };

  // Filtered lists
  const filteredStudents = students.filter(s => {
    const u = users.find(usr => usr.id === s.user_id);
    if (!u) return false;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.nis.includes(searchQuery) || 
                          s.nisn.includes(searchQuery);
    const matchesClass = filterClass === 'semua' || s.class_id === filterClass;
    const matchesGender = filterGender === 'semua' || s.gender === filterGender;
    return matchesSearch && matchesClass && matchesGender;
  });

  const filteredTeachers = teachers.filter(t => {
    const u = users.find(usr => usr.id === t.user_id);
    if (!u) return false;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.nip.includes(searchQuery) || 
                          t.subject_specialization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans" id="admin-view">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="font-display font-black text-white text-base tracking-wide block">SD MERDEKA</span>
            <span className="text-xs text-blue-400 font-bold tracking-wider uppercase">Portal Admin</span>
          </div>
        </div>

        {/* Admin profile detail */}
        <div className="p-4 mx-4 my-6 bg-slate-800/50 border border-slate-800 rounded-2xl flex items-center gap-3">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden">
            <span className="font-bold text-white text-sm block truncate">{currentUser.name}</span>
            <span className="text-xs text-slate-400 block font-medium capitalize">{currentUser.role} Sekolah</span>
          </div>
        </div>

        <nav className="grow px-4 space-y-1.5">
          {[
            { id: 'dashboard', label: 'Dashboard Utama', icon: BookOpen },
            { id: 'siswa', label: 'Data Siswa (Murid)', icon: Users },
            { id: 'guru', label: 'Data Guru Pengajar', icon: UserCheck },
            { id: 'kelas', label: 'Manajemen Kelas', icon: GraduationCap },
            { id: 'pengumuman', label: 'Mading / Pengumuman', icon: Megaphone },
            { id: 'pembayaran', label: 'Pembayaran SPP', icon: DollarSign },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as ActiveTab); setSearchQuery(''); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            id="logout-btn-admin"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-950/30 text-red-400 hover:text-red-300 rounded-xl text-sm font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="grow overflow-y-auto h-screen p-6 sm:p-8">
        
        {/* Statistics Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-800">Selamat Datang, {currentUser.name}!</h1>
                <p className="text-slate-500 text-sm mt-1">Gunakan panel ini untuk mengelola siswa, guru, kelas, dan mading digital sekolah.</p>
              </div>
              <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs font-bold w-max self-start">
                T.A. 2026/2027 • Semester Ganjil
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Total Siswa', value: students.length, desc: 'Siswa aktif terdaftar', icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                { title: 'Total Guru', value: teachers.length, desc: 'Tenaga pendidik aktif', icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                { title: 'Total Kelas', value: classes.length, desc: 'Kelompok belajar', icon: GraduationCap, color: 'text-purple-600 bg-purple-50 border-purple-100' },
                { title: 'Pengumuman', value: announcements.length, desc: 'Telah diterbitkan', icon: Megaphone, color: 'text-amber-600 bg-amber-50 border-amber-100' }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className={`p-6 bg-white border rounded-3xl shadow-xs flex items-start gap-4 ${stat.color}`}>
                    <div className="p-3 bg-white rounded-2xl shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{stat.title}</span>
                      <span className="font-display font-black text-3xl text-slate-800 block mt-1">{stat.value}</span>
                      <span className="text-slate-400 text-xs mt-1 block">{stat.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Shortcuts & Quick View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Shortcut buttons */}
              <div className="bg-white p-6 sm:p-8 border border-slate-100 rounded-3xl shadow-xs space-y-4">
                <h3 className="font-display font-bold text-lg text-slate-800">Aksi Cepat Admin</h3>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => { setActiveTab('siswa'); openAddModal('siswa'); }}
                    className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-2xl text-xs text-left transition-colors flex items-center justify-between"
                  >
                    <span>+ Tambah Siswa & Wali Baru</span>
                    <Plus className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { setActiveTab('guru'); openAddModal('guru'); }}
                    className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-2xl text-xs text-left transition-colors flex items-center justify-between"
                  >
                    <span>+ Daftarkan Guru Baru</span>
                    <Plus className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { setActiveTab('kelas'); openAddModal('kelas'); }}
                    className="w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-2xl text-xs text-left transition-colors flex items-center justify-between"
                  >
                    <span>+ Tambah Ruang Kelas</span>
                    <Plus className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { setActiveTab('pengumuman'); openAddModal('pengumuman'); }}
                    className="w-full py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-2xl text-xs text-left transition-colors flex items-center justify-between"
                  >
                    <span>+ Terbitkan Pengumuman Mading</span>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mading list inside admin overview */}
              <div className="lg:col-span-2 bg-white p-6 sm:p-8 border border-slate-100 rounded-3xl shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-lg text-slate-800">Mading Digital Aktif</h3>
                  <div className="divide-y divide-slate-100">
                    {announcements.slice(0, 3).map((ann) => (
                      <div key={ann.id} className="py-3 flex justify-between items-center gap-4">
                        <div>
                          <span className="font-bold text-slate-700 text-sm block hover:text-blue-600 transition-colors cursor-pointer">{ann.title}</span>
                          <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Sasaran: {ann.target_role}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                          {new Date(ann.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('pengumuman')}
                  className="mt-6 text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1"
                >
                  <span>Kelola Mading Pengumuman</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SISWA TAB */}
        {activeTab === 'siswa' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-extrabold text-2xl text-slate-800">Kelola Data Siswa</h1>
                <p className="text-slate-500 text-sm mt-0.5">Daftar siswa dasar terintegrasi dengan akun login & wali murid.</p>
              </div>
              <div className="flex gap-2.5">
                <button 
                  onClick={() => handleExportData('siswa')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Ekspor CSV</span>
                </button>
                <button 
                  onClick={() => {
                    setImportPreviewData([]);
                    setImportError('');
                    setIsImportModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-md shadow-amber-100 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Siswa</span>
                </button>
                <button 
                  onClick={() => openAddModal('siswa')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-md shadow-blue-100 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Siswa</span>
                </button>
              </div>
            </div>

            {/* Filters & Search bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center gap-4">
<div className="relative grow w-full">
                <Search className="absolute top-3 left-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Cari nama siswa, NIS, atau NISN..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
</div>

              <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs w-full">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select 
                    value={filterClass}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterClass(e.target.value)}
                    className="bg-transparent focus:outline-none w-full"
                  >
                    <option value="semua">Semua Kelas</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>Kelas {c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs w-full">
                  <select 
                    value={filterGender}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterGender(e.target.value)}
                    className="bg-transparent focus:outline-none w-full"
                  >
                    <option value="semua">Semua Gender</option>
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4 sm:p-5">Foto</th>
                      <th className="p-4 sm:p-5">NIS / NISN</th>
                      <th className="p-4 sm:p-5">Nama Lengkap</th>
                      <th className="p-4 sm:p-5">Kelas</th>
                      <th className="p-4 sm:p-5">L/P</th>
                      <th className="p-4 sm:p-5">Orang Tua / Wali</th>
                      <th className="p-4 sm:p-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((stud) => {
                        const u = users.find(usr => usr.id === stud.user_id);
                        const cls = classes.find(c => c.id === stud.class_id);
                        const prnt = parents.find(p => p.id === stud.parent_id);
                        return (
                          <tr key={stud.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              <img 
                                src={u?.avatar} 
                                alt={u?.name} 
                                className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                            </td>
                            <td className="p-4">
                              <span className="text-slate-800 font-bold block">{stud.nis}</span>
                              <span className="text-slate-400 block text-[10px] mt-0.5">NISN: {stud.nisn}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-slate-800 font-bold block text-sm">{u?.name}</span>
                              <span className="text-slate-400 block text-[10px] mt-0.5">{u?.email}</span>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold">
                                Kelas {cls?.name || 'Belum diatur'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-slate-700">{stud.gender}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-slate-800 block text-xs font-bold">👦 Ayah: {prnt?.father_name || '-'}</span>
                              <span className="text-slate-400 block text-[10px] mt-0.5">📞 {prnt?.phone || '-'}</span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={() => openEditModal('siswa', stud.id)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(stud.user_id, 'siswa')}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                          Tidak ditemukan data siswa matching pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* GURU TAB */}
        {activeTab === 'guru' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-extrabold text-2xl text-slate-800">Kelola Data Guru</h1>
                <p className="text-slate-500 text-sm mt-0.5">Daftar guru pendidik profesional SDIT ABDUL HARIS.</p>
              </div>
              <div className="flex gap-2.5">
                <button 
                  onClick={() => handleExportData('guru')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Ekspor CSV</span>
                </button>
                <button 
                  onClick={() => openAddModal('guru')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-md shadow-blue-100 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Guru</span>
                </button>
              </div>
            </div>

            {/* Search filter bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <div className="relative w-full">
                <Search className="absolute top-3 left-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Cari nama guru, NIP, atau spesialisasi..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Guru table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4 sm:p-5">Foto</th>
                      <th className="p-4 sm:p-5">NIP</th>
                      <th className="p-4 sm:p-5">Nama Lengkap</th>
                      <th className="p-4 sm:p-5">Spesialisasi Mengajar</th>
                      <th className="p-4 sm:p-5">Kontak Telepon</th>
                      <th className="p-4 sm:p-5">Alamat Tinggal</th>
                      <th className="p-4 sm:p-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {filteredTeachers.length > 0 ? (
                      filteredTeachers.map((teach) => {
                        const u = users.find(usr => usr.id === teach.user_id);
                        return (
                          <tr key={teach.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              <img 
                                src={u?.avatar} 
                                alt={u?.name} 
                                className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                            </td>
                            <td className="p-4">
                              <span className="text-slate-800 font-bold block">{teach.nip}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-slate-800 font-bold block text-sm">{u?.name}</span>
                              <span className="text-slate-400 block text-[10px] mt-0.5">{u?.email}</span>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold">
                                {teach.subject_specialization}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-slate-700">{u?.phone}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-slate-500 text-xs line-clamp-1">{teach.address}</span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={() => openEditModal('guru', teach.id)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(teach.user_id, 'guru')}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                          Tidak ditemukan data guru matching pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* KELAS TAB */}
        {activeTab === 'kelas' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-extrabold text-2xl text-slate-800">Manajemen Ruang Kelas</h1>
                <p className="text-slate-500 text-sm mt-0.5">Daftar kelas aktif beserta wali kelas pendamping.</p>
              </div>
              <button 
                onClick={() => openAddModal('kelas')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kelas</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => {
                const teach = teachers.find(t => t.id === cls.homeroom_teacher_id);
                const teacherUser = users.find(u => u.id === teach?.user_id);
                const countSiswa = students.filter(s => s.class_id === cls.id).length;

                return (
                  <div key={cls.id} className="bg-white p-6 border border-slate-100 rounded-3xl shadow-xs relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-extrabold uppercase">
                          Tingkat {cls.grade_level}
                        </span>
                        <h3 className="font-display font-black text-3xl text-slate-800 mt-2">Kelas {cls.name}</h3>
                      </div>
                      <div className="p-3 bg-slate-50 text-slate-700 rounded-2xl font-black text-lg shadow-xs">
                        🎒 {countSiswa} <span className="text-xs text-slate-400 font-medium">Siswa</span>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <img 
                          src={teacherUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'} 
                          alt={teacherUser?.name} 
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Wali Kelas</span>
                          <span className="text-xs font-bold text-slate-700 block">{teacherUser?.name || 'Belum diatur'}</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-1 pt-2">
                        <button 
                          onClick={() => openEditModal('kelas', cls.id)}
                          className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteClass(cls.id)}
                          className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PENGUMUMAN TAB */}
        {activeTab === 'pengumuman' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-extrabold text-2xl text-slate-800">Mading Pengumuman Sekolah</h1>
                <p className="text-slate-500 text-sm mt-0.5">Tulis dan terbitkan pengumuman mading digital sekolah.</p>
              </div>
              <button 
                onClick={() => openAddModal('pengumuman')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Terbitkan Mading</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col justify-between">
                  {ann.image_url && (
                    <div className="h-44 w-full overflow-hidden">
                      <img 
                        src={ann.image_url} 
                        alt={ann.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="p-6 grow space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
                        Sasaran: {ann.target_role}
                      </span>
                      <span className="text-slate-400 text-xs font-medium">
                        {new Date(ann.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-slate-800 leading-snug">{ann.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-4">{ann.content}</p>
                  </div>

                  <div className="px-6 py-4 border-t border-slate-50 flex justify-end gap-1.5 bg-slate-50/50">
                    <button 
                      onClick={() => openEditModal('pengumuman', ann.id)}
                      className="px-3.5 py-1.5 text-blue-600 hover:bg-blue-100/50 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="px-3.5 py-1.5 text-red-600 hover:bg-red-100/50 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PEMBAYARAN TAB */}
        {activeTab === 'pembayaran' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-800">Pembayaran SPP Sekolah</h1>
                <p className="text-slate-500 text-sm mt-1">Input tagihan baru untuk seluruh siswa dan verifikasi bukti transfer wali murid.</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Total Tagihan', value: payments.length, icon: DollarSign, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                { title: 'Sudah Lunas', value: payments.filter(p => p.status === 'lunas').length, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                { title: 'Menunggu Verifikasi', value: payments.filter(p => p.status === 'proses_verifikasi').length, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                { title: 'Belum Dibayar', value: payments.filter(p => p.status === 'belum_lunas').length, icon: ShieldAlert, color: 'text-red-600 bg-red-50 border-red-100' },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className={`p-5 bg-white border rounded-2xl flex items-start gap-3.5 ${stat.color}`}>
                    <div className="p-2.5 bg-white rounded-xl shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{stat.title}</span>
                      <span className="font-display font-black text-2xl text-slate-800 block mt-0.5">{stat.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Input Tagihan Baru */}
              <div className="lg:col-span-1 bg-white p-6 border border-slate-100 rounded-3xl shadow-xs h-fit">
                <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Menerbitkan Tagihan Baru
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-2">
                  Gunakan formulir ini untuk membuat tagihan pembayaran SPP baru bagi <b>seluruh siswa aktif</b> di database secara serentak.
                </p>

                <form onSubmit={handleCreateBulkPayment} className="space-y-4 pt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Periode Bulan SPP</label>
                    <select 
                      value={paymentMonth} 
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPaymentMonth(e.target.value)} 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      <option value="Juli 2026">Juli 2026</option>
                      <option value="Agustus 2026">Agustus 2026</option>
                      <option value="September 2026">September 2026</option>
                      <option value="Oktober 2026">Oktober 2026</option>
                      <option value="November 2026">November 2026</option>
                      <option value="Desember 2026">Desember 2026</option>
                      <option value="Januari 2027">Januari 2027</option>
                      <option value="Februari 2027">Februari 2027</option>
                      <option value="Maret 2027">Maret 2027</option>
                      <option value="April 2027">April 2027</option>
                      <option value="Mei 2027">Mei 2027</option>
                      <option value="Juni 2027">Juni 2027</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Jumlah Nominal (Rp)</label>
                    <input 
                      type="number" 
                      required 
                      value={paymentAmount} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentAmount(Number(e.target.value))} 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Terbitkan Tagihan Serentak</span>
                  </button>
                </form>
              </div>

              {/* Daftar Status Tagihan SPP Siswa */}
              <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-800">Daftar Tagihan & Verifikasi Transfer</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Pantau status transaksi keuangan SPP sekolah.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-6">Siswa</th>
                        <th className="py-3 px-6">Bulan Periode</th>
                        <th className="py-3 px-6">Jumlah</th>
                        <th className="py-3 px-6 text-center">Status</th>
                        <th className="py-3 px-6 text-right">Aksi & Bukti</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-600 text-xs">
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 font-bold">
                            Belum ada tagihan SPP diterbitkan. Gunakan modul sebelah kiri untuk menerbitkan tagihan.
                          </td>
                        </tr>
                      ) : (
                        payments.map((p) => {
                          const stud = students.find(s => s.id === p.student_id);
                          const user = stud ? users.find(u => u.id === stud.user_id) : null;
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50">
                              <td className="py-4 px-6">
                                <div className="font-bold text-slate-800">{user?.name || 'Siswa Terhapus'}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">NIS: {stud?.nis || '-'}</div>
                              </td>
                              <td className="py-4 px-6 font-bold text-slate-700">{p.month}</td>
                              <td className="py-4 px-6 font-mono font-bold text-slate-800">Rp {p.amount.toLocaleString('id-ID')}</td>
                              <td className="py-4 px-6 text-center">
                                {p.status === 'lunas' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-extrabold">
                                    <CheckCircle className="w-3 h-3" />
                                    LUNAS
                                  </span>
                                ) : p.status === 'proses_verifikasi' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-extrabold animate-pulse">
                                    <Clock className="w-3 h-3" />
                                    VERIFIKASI
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-extrabold">
                                    <ShieldAlert className="w-3 h-3" />
                                    BELUM BAYAR
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-right space-y-1.5">
                                {p.proof_file_url ? (
                                  <div className="flex flex-col items-end gap-1.5">
                                    <a 
                                      href={p.proof_file_url} 
                                      download={p.proof_file_name || 'bukti.png'}
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                      👁️ Lihat Bukti Transfer
                                    </a>
                                    {p.status !== 'lunas' && (
                                      <div className="flex gap-1.5">
                                        <button 
                                          onClick={() => handleConfirmPaymentStatus(p.id, 'lunas')}
                                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                                        >
                                          Setujui Lunas
                                        </button>
                                        <button 
                                          onClick={() => handleConfirmPaymentStatus(p.id, 'belum_lunas')}
                                          className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-[10px] font-bold cursor-pointer"
                                        >
                                          Tolak
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex justify-end gap-1">
                                    {p.status !== 'lunas' ? (
                                      <button 
                                        onClick={() => handleConfirmPaymentStatus(p.id, 'lunas')}
                                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold cursor-pointer"
                                      >
                                        Set Lunas Manual
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => handleConfirmPaymentStatus(p.id, 'belum_lunas')}
                                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold cursor-pointer"
                                      >
                                        Batalkan Lunas
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CRUD Overlay Dialog Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 z-10"
          >
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-lg">
                  {editingId ? 'Edit' : 'Tambah'} {modalType === 'siswa' ? 'Siswa & Wali' : modalType === 'guru' ? 'Guru Pengajar' : modalType === 'kelas' ? 'Ruang Kelas' : 'Mading Pengumuman'}
                </h3>
                <p className="text-xs text-blue-100 mt-1">Isi formulir lengkap di bawah ini</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* SISWA FORM */}
              {modalType === 'siswa' && (
                <div className="space-y-4">
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">1. Data Akun Siswa & Wajah</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap Siswa</label>
                        <input type="text" required value={formName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormName(e.target.value)} placeholder="E.g. Kiki Pratama" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Email Login</label>
                        <input type="email" required value={formEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormEmail(e.target.value)} placeholder="kiki@sekolah.sch.id" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Password Login Siswa</label>
                        <input type="text" required value={formStudentPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormStudentPassword(e.target.value)} placeholder="siswa" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                          <span>Foto Wajah Siswa (JPEG/PNG)</span>
                          {formStudentAvatar && <span className="text-[9px] text-emerald-600 font-bold">Terunggah</span>}
                        </label>
                        <div className="relative flex items-center justify-center border border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-1 bg-white cursor-pointer transition-colors">
                          <input type="file" accept=".jpg,.jpeg,.png" onChange={handleStudentAvatarChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          <span className="text-[11px] text-slate-500 font-semibold truncate px-2">
                            {studentAvatarName || 'Pilih foto wajah...'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">2. Identitas Pokok & Kelas</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nomor Induk Siswa (NIS)</label>
                        <input type="text" required value={formNis} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormNis(e.target.value)} placeholder="26001" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">NIS Nasional (NISN)</label>
                        <input type="text" required value={formNisn} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormNisn(e.target.value)} placeholder="0152938102" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Kelas Tujuan</label>
                        <select value={formClassId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormClassId(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none">
                          {classes.map(c => <option key={c.id} value={c.id}>Kelas {c.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Jenis Kelamin</label>
                        <div className="flex gap-4 mt-1.5">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <input type="radio" name="gender" checked={formGender === 'L'} onChange={() => setFormGender('L')} />
                            Laki-laki
                          </label>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <input type="radio" name="gender" checked={formGender === 'P'} onChange={() => setFormGender('P')} />
                            Perempuan
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tempat Lahir</label>
                        <input type="text" value={formBirthPlace} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormBirthPlace(e.target.value)} placeholder="E.g. Jakarta" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal Lahir</label>
                        <input type="date" value={formBirthDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormBirthDate(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none" />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Alamat Lengkap Rumah</label>
                        <textarea value={formAddress} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormAddress(e.target.value)} placeholder="Jl. Pemuda No. 8..." rows={2} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">3. Data Orang Tua (Wali) & Login</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Ayah Kandung</label>
                        <input type="text" required value={formParentFather} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormParentFather(e.target.value)} placeholder="E.g. Joko Pratama" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Ibu Kandung</label>
                        <input type="text" required value={formParentMother} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormParentMother(e.target.value)} placeholder="E.g. Ambar Lestari" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Pekerjaan Utama Ayah</label>
                        <input type="text" value={formParentJob} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormParentJob(e.target.value)} placeholder="E.g. Wiraswasta" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Kontak Telepon Wali</label>
                        <input type="text" required value={formPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormPhone(e.target.value)} placeholder="086789012345" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Email Login Wali</label>
                        <input type="email" value={formParentEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormParentEmail(e.target.value)} placeholder={`${formNis || 'nis'}@wali.merdeka.id`} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Password Login Wali</label>
                        <input type="text" required value={formParentPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormParentPassword(e.target.value)} placeholder="wali" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* GURU FORM */}
              {modalType === 'guru' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Nama Lengkap Guru</label>
                      <input type="text" required value={formName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormName(e.target.value)} placeholder="Budi Santoso, S.Pd." className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">NIP Pegawai</label>
                      <input type="text" required value={formNip} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormNip(e.target.value)} placeholder="198503122010121002" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Email Sekolah</label>
                      <input type="email" required value={formEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormEmail(e.target.value)} placeholder="budi@sekolah.sch.id" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">No Telepon Aktif</label>
                      <input type="text" required value={formPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormPhone(e.target.value)} placeholder="082345678901" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Spesialisasi Mengajar (Mata Pelajaran)</label>
                      <input type="text" required value={formSpecialization} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormSpecialization(e.target.value)} placeholder="Matematika, IPA, Seni Rupa..." className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Alamat Rumah Lengkap</label>
                      <textarea required value={formAddress} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormAddress(e.target.value)} placeholder="Jl. Merpati No. 12..." rows={3} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* KELAS FORM */}
              {modalType === 'kelas' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Nama Kelas</label>
                      <input type="text" required value={formClassName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormClassName(e.target.value)} placeholder="E.g. 1A, 2B, 6A" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Tingkatan Sekolah</label>
                      <select value={formGradeLevel} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormGradeLevel(Number(e.target.value))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
                        {[1,2,3,4,5,6].map(lvl => <option key={lvl} value={lvl}>Tingkat SD {lvl}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Pilih Wali Kelas (Homeroom Teacher)</label>
                      <select value={formHomeroomTeacher} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormHomeroomTeacher(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
                        {teachers.map(t => {
                          const u = users.find(usr => usr.id === t.user_id);
                          return <option key={t.id} value={t.id}>{u?.name || 'Unbeknownst'} (NIP: {t.nip})</option>;
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* PENGUMUMAN FORM */}
              {modalType === 'pengumuman' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Judul Pengumuman</label>
                    <input type="text" required value={formAnnTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormAnnTitle(e.target.value)} placeholder="Lomba Mewarnai Hari Kemerdekaan..." className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Sasaran Target Pembaca</label>
                      <select value={formAnnTarget} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormAnnTarget(e.target.value as any)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
                        <option value="semua">Semua Warga Sekolah</option>
                        <option value="guru">Khusus Bapak/Ibu Guru</option>
                        <option value="siswa">Khusus Siswa/Murid</option>
                        <option value="wali">Khusus Orang Tua / Wali</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 flex items-center justify-between">
                        <span>Gambar Pendukung Mading (File Lokal / URL)</span>
                        {formAnnImage && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormAnnImage('');
                              setFormAnnImageName('');
                            }}
                            className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                          >
                            Hapus Gambar
                          </button>
                        )}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                        {/* File Upload Area */}
                        <div className="relative flex flex-col items-center justify-center border border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-3 bg-slate-50 hover:bg-slate-100/50 transition-colors cursor-pointer text-center min-h-17.5">
                          <input 
                            type="file" 
                            accept=".jpg,.jpeg,.png,.gif" 
                            onChange={handleAnnImageChange} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          />
                          <Upload className="w-4 h-4 text-blue-500 mb-1" />
                          <span className="text-[10px] font-bold text-slate-700 block truncate max-w-45">
                            {formAnnImageName || 'Unggah Gambar Lokal'}
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">JPEG, PNG, atau GIF</span>
                        </div>

                        {/* URL input Area */}
                        <div className="flex flex-col justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-17.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Atau gunakan URL Gambar</span>
                          <input 
                            type="text" 
                            value={formAnnImage.startsWith('data:') ? '' : formAnnImage} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setFormAnnImage(e.target.value);
                              setFormAnnImageName(e.target.value ? 'Gunakan URL' : '');
                            }} 
                            placeholder="https://example.com/image.jpg" 
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] focus:ring-1 focus:ring-blue-500 focus:outline-none mt-1" 
                          />
                        </div>
                      </div>

                      {/* Live Image Preview */}
                      {formAnnImage && (
                        <div className="mt-2 border border-slate-100 rounded-xl overflow-hidden bg-slate-50 p-2 flex items-center gap-3">
                          <img 
                            src={formAnnImage} 
                            alt="Preview Mading" 
                            className="w-14 h-14 object-cover rounded-lg shadow-xs shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold text-slate-700">Pratinjau Gambar Mading</div>
                            <div className="text-[9px] text-slate-400 mt-0.5 truncate max-w-sm">
                              {formAnnImage.startsWith('data:') ? 'File lokal terunggah' : formAnnImage}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Isi Pengumuman Lengkap</label>
                    <textarea required value={formAnnContent} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormAnnContent(e.target.value)} placeholder="Tulis rincian pengumuman disini..." rows={5} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"></textarea>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 px-6 py-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Data</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* IMPORT SISWA MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setIsImportModalOpen(false)}></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 z-10"
          >
            <div className="bg-linear-to-r from-amber-500 to-orange-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Import Data Siswa Massal
                </h3>
                <p className="text-xs text-amber-50 mt-1">Impor data banyak siswa sekaligus menggunakan format file spreadsheet/CSV</p>
              </div>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Step 1: Download template */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Langkah 1: Unduh Template Resmi</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Gunakan template CSV standar agar kolom data terbaca sempurna oleh sistem kami.</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4 text-amber-500" />
                  <span>Unduh Template</span>
                </button>
              </div>

              {/* Step 2: Upload Area */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Langkah 2: Unggah File CSV Anda</h4>
                <div className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-2xl p-6 text-center cursor-pointer transition-colors relative group">
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-amber-50 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Pilih File CSV atau Drag & Drop</span>
                    <span className="text-[10px] text-slate-400">Pastikan file bertipe .csv dan maksimal 2MB</span>
                  </div>
                </div>
              </div>

              {importError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Preview parsed data if exists */}
              {importPreviewData.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Pratinjau Data Terbaca ({importPreviewData.length} Siswa)</h4>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold">Format Sesuai</span>
                  </div>

                  <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                          <th className="p-2">NIS</th>
                          <th className="p-2">Nama Lengkap</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">L/P</th>
                          <th className="p-2">Kelas ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                        {importPreviewData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-800">{item.nis}</td>
                            <td className="p-2 text-slate-800 font-bold">{item.name}</td>
                            <td className="p-2">{item.email}</td>
                            <td className="p-2 text-center">{item.gender}</td>
                            <td className="p-2 text-center">
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-mono font-extrabold">{item.classId}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[10px] text-blue-700 leading-relaxed font-semibold">
                    💡 Sistem akan secara otomatis membuatkan akun login gratis untuk **Wali Murid** yang berelasi dengan NIS di atas dengan format email: <code className="bg-blue-100 px-1 rounded">[NIS]@wali.merdeka.id</code>.
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 px-6 py-4">
              <button 
                type="button" 
                onClick={() => setIsImportModalOpen(false)} 
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="button"
                disabled={importPreviewData.length === 0}
                onClick={handleExecuteImport}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  importPreviewData.length > 0 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mulai Proses Import</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
