import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, LogOut, Check, X, Calendar, Clock, Sparkles, 
  Plus, Edit, Save, ListTodo, UserCheck, Award, FileText, AlertCircle,
  Camera, Download, Upload, CheckCircle, QrCode, RefreshCw, Eye
} from 'lucide-react';
import { LocalDB } from '../lib/db';
import { 
  User, Teacher, Student, SchoolClass, Subject, Schedule, 
  Grade, Attendance, Assignment, Submission 
} from '../types/database';

interface TeacherDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

type TeacherTab = 'jadwal' | 'absensi' | 'nilai' | 'tugas';

export default function TeacherDashboard({ currentUser, onLogout }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<TeacherTab>('jadwal');
  
  // DB States
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [teacherClass, setTeacherClass] = useState<SchoolClass | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  // Action states
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedGradeType, setSelectedGradeType] = useState<'tugas' | 'uh' | 'uts' | 'uas'>('tugas');

  // Input States for New Assignment
  const [newAsgTitle, setNewAsgTitle] = useState('');
  const [newAsgDesc, setNewAsgDesc] = useState('');
  const [newAsgDeadline, setNewAsgDeadline] = useState('2026-07-15 08:00');
  const [newAsgFileName, setNewAsgFileName] = useState('');
  const [newAsgFileUrl, setNewAsgFileUrl] = useState('');

  // Submissions State for Grading
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [gradeSubTab, setGradeSubTab] = useState<'input_manual' | 'nilai_tugas' | 'rekap_nilai'>('input_manual');
  const [gradingAssignmentId, setGradingAssignmentId] = useState<string>('');

  // Attendance Sub-Tabs & Recap State
  const [attendanceSubTab, setAttendanceSubTab] = useState<'pencatatan' | 'rekap' | 'qr_scan'>('pencatatan');
  const [recapMode, setRecapMode] = useState<'harian' | 'mingguan' | 'bulanan'>('bulanan');
  const [recapDate, setRecapDate] = useState(new Date().toISOString().split('T')[0]);

  // QR Scanning States
  const [qrSelectedStudentId, setQrSelectedStudentId] = useState('');
  const [isQrScanning, setIsQrScanning] = useState(false);

  // Attendance Sheet state (Student ID -> Status)
  const [attendanceSheet, setAttendanceSheet] = useState<Record<string, 'hadir' | 'sakit' | 'izin' | 'alpha'>>({});
  const [attendanceNotes, setAttendanceNotes] = useState<Record<string, string>>({});

  // Grades entry sheet (Student ID -> Score)
  const [gradesSheet, setGradesSheet] = useState<Record<string, string>>({});
  const [gradesNotes, setGradesNotes] = useState<Record<string, string>>({});

  const [toastMessage, setToastMessage] = useState('');

  const refreshData = () => {
    const allUsers = LocalDB.getUsers();
    const allTeachers = LocalDB.getTeachers();
    const allClasses = LocalDB.getClasses();
    const allStudents = LocalDB.getStudents();
    const allSchedules = LocalDB.getSchedules();
    const allSubjects = LocalDB.getSubjects();
    const allAsgs = LocalDB.getAssignments();
    const allAtnd = LocalDB.getAttendances();
    const allGrds = LocalDB.getGrades();
    const allSubms = LocalDB.getSubmissions();

    setUsers(allUsers);
    setSubjects(allSubjects);
    setAttendances(allAtnd);
    setGrades(allGrds);
    setSubmissions(allSubms);

    // Find current teacher
    const currentTeacher = allTeachers.find(t => t.user_id === currentUser.id);
    if (currentTeacher) {
      setTeacher(currentTeacher);
      
      // Find class where teacher is homeroom
      const cls = allClasses.find(c => c.homeroom_teacher_id === currentTeacher.id);
      if (cls) {
        setTeacherClass(cls);
        setSelectedClassId(cls.id);
        
        // Find students in this class
        const clsStudents = allStudents.filter(s => s.class_id === cls.id);
        setStudents(clsStudents);
      } else if (allClasses.length > 0) {
        // Fallback to first class if not homeroom
        setTeacherClass(allClasses[0]);
        setSelectedClassId(allClasses[0].id);
        const clsStudents = allStudents.filter(s => s.class_id === allClasses[0].id);
        setStudents(clsStudents);
      }

      // Find teacher schedules
      const teachScheds = allSchedules.filter(s => s.teacher_id === currentTeacher.id);
      setSchedules(teachScheds);

      // Filter assignments posted by this teacher
      const teachAsgs = allAsgs.filter(a => a.teacher_id === currentTeacher.id);
      setAssignments(teachAsgs);

      // Default select subject
      if (allSubjects.length > 0) {
        setSelectedSubjectId(allSubjects[0].id);
      }
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Pre-fill Attendance Sheet for the day
  useEffect(() => {
    if (students.length > 0) {
      const todayString = new Date().toISOString().split('T')[0];
      const todayAtnd = attendances.filter(a => a.date === todayString);

      const sheet: Record<string, 'hadir' | 'sakit' | 'izin' | 'alpha'> = {};
      const notes: Record<string, string> = {};

      students.forEach(s => {
        const record = todayAtnd.find(a => a.student_id === s.id);
        sheet[s.id] = record?.status || 'hadir';
        notes[s.id] = record?.notes || '';
      });

      setAttendanceSheet(sheet);
      setAttendanceNotes(notes);
    }
  }, [students, attendances]);

  // Pre-fill Grades Entry sheet
  useEffect(() => {
    if (students.length > 0 && selectedSubjectId) {
      const sheet: Record<string, string> = {};
      const notes: Record<string, string> = {};

      students.forEach(s => {
        const record = grades.find(g => 
          g.student_id === s.id && 
          g.subject_id === selectedSubjectId && 
          g.type === selectedGradeType
        );
        sheet[s.id] = record ? record.score.toString() : '';
        notes[s.id] = record ? record.notes : '';
      });

      setGradesSheet(sheet);
      setGradesNotes(notes);
    }
  }, [students, selectedSubjectId, selectedGradeType, grades]);

  // Submit Absensi
  const handleSaveAttendance = () => {
    const todayString = new Date().toISOString().split('T')[0];
    let currentAtnd = [...LocalDB.getAttendances()];

    // Remove existing records for these students on today's date
    const studentIds = students.map(s => s.id);
    currentAtnd = currentAtnd.filter(a => !(a.date === todayString && studentIds.includes(a.student_id)));

    // Create new records
    students.forEach(s => {
      const status = attendanceSheet[s.id] || 'hadir';
      const note = attendanceNotes[s.id] || '';
      
      currentAtnd.push({
        id: `at-gen-${s.id}-${todayString}`,
        student_id: s.id,
        date: todayString,
        status,
        notes: note,
        recorded_by: teacher?.id || 't-unknown'
      });
    });

    LocalDB.setAttendances(currentAtnd);
    refreshData();
    showToast('Presensi hari ini berhasil disimpan!');
  };

  // Submit Grades
  const handleSaveGrades = () => {
    let currentGrades = [...LocalDB.getGrades()];

    students.forEach(s => {
      const scoreStr = gradesSheet[s.id];
      if (scoreStr !== undefined && scoreStr !== '') {
        const score = parseFloat(scoreStr);
        if (isNaN(score) || score < 0 || score > 100) return;

        // Check if existing grade for subject + student + type
        const existingIdx = currentGrades.findIndex(g => 
          g.student_id === s.id && 
          g.subject_id === selectedSubjectId && 
          g.type === selectedGradeType
        );

        const record: Grade = {
          id: existingIdx !== -1 ? currentGrades[existingIdx].id : `g-gen-${s.id}-${selectedSubjectId}-${selectedGradeType}`,
          student_id: s.id,
          subject_id: selectedSubjectId,
          teacher_id: teacher?.id || 't-unknown',
          academic_year_id: 'ay-1',
          type: selectedGradeType,
          score,
          notes: gradesNotes[s.id] || ''
        };

        if (existingIdx !== -1) {
          currentGrades[existingIdx] = record;
        } else {
          currentGrades.push(record);
        }
      }
    });

    LocalDB.setGrades(currentGrades);
    refreshData();
    showToast('Daftar nilai berhasil diunggah!');
  };

  const handleTeacherFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewAsgFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewAsgFileUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Post Assignment
  const handlePostAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgTitle || !newAsgDesc) {
      alert('Judul dan deskripsi tugas harus diisi!');
      return;
    }

    const newAsg: Assignment = {
      id: 'as-' + Math.random().toString(36).substr(2, 9),
      class_id: selectedClassId,
      subject_id: selectedSubjectId,
      teacher_id: teacher?.id || 't-1',
      title: newAsgTitle,
      description: newAsgDesc,
      deadline: newAsgDeadline,
      file_name: newAsgFileName || undefined,
      file_url: newAsgFileUrl || undefined,
      created_at: new Date().toISOString()
    };

    const currentAsgs = LocalDB.getAssignments();
    currentAsgs.unshift(newAsg);
    LocalDB.setAssignments(currentAsgs);

    setNewAsgTitle('');
    setNewAsgDesc('');
    setNewAsgFileName('');
    setNewAsgFileUrl('');
    
    // Clear the file input in UI if needed (controlled state or form reset)
    const fileInput = document.getElementById('teacher-asg-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    refreshData();
    showToast('Tugas/materi baru berhasil diterbitkan untuk siswa!');
  };

  // Grade student homework submission
  const handleSaveSubmissionGrade = (submissionId: string, score: number, notes: string) => {
    if (isNaN(score) || score < 0 || score > 100) {
      alert('Skor nilai harus berkisar dari 0 sampai 100!');
      return;
    }

    let allSubms = [...LocalDB.getSubmissions()];
    const submIdx = allSubms.findIndex(s => s.id === submissionId);
    if (submIdx === -1) return;

    const updatedSubm: Submission = {
      ...allSubms[submIdx],
      score,
      notes,
      status: 'dinilai'
    };
    allSubms[submIdx] = updatedSubm;
    LocalDB.setSubmissions(allSubms);

    // Also inject/sync this grade into the standard Grade entity list in LocalDB
    let currentGrades = [...LocalDB.getGrades()];
    const activeAsg = assignments.find(a => a.id === updatedSubm.assignment_id);
    
    if (activeAsg) {
      const existingGradeIdx = currentGrades.findIndex(g => 
        g.student_id === updatedSubm.student_id && 
        g.subject_id === activeAsg.subject_id && 
        g.type === 'tugas'
      );

      const newGradeRecord: Grade = {
        id: existingGradeIdx !== -1 ? currentGrades[existingGradeIdx].id : `g-gen-subm-${updatedSubm.id}`,
        student_id: updatedSubm.student_id,
        subject_id: activeAsg.subject_id,
        teacher_id: teacher?.id || 't-unknown',
        academic_year_id: 'ay-1',
        type: 'tugas',
        score,
        notes: `Tugas: ${activeAsg.title}. Komentar: ${notes}`
      };

      if (existingGradeIdx !== -1) {
        currentGrades[existingGradeIdx] = newGradeRecord;
      } else {
        currentGrades.push(newGradeRecord);
      }
      LocalDB.setGrades(currentGrades);
    }

    refreshData();
    showToast(`Nilai berhasil disimpan untuk ${updatedSubm.student_name}!`);
  };

  // QR scan flow akan dihapus dari fitur simulasi. Di fase ini absensi tetap melalui Input Manual & Rekap.
  // (Implementasi scan kamera live akan ditambahkan pada iterasi berikutnya.)
  const handleRemoveQRCodeSim = () => {
    // noop: tombol akan dihapus dari UI
  };



  const handleDownloadRekapGrades = () => {
    if (!selectedSubjectId) {
      alert('Silakan pilih mata pelajaran terlebih dahulu!');
      return;
    }

    const selectedSubj = subjects.find(s => s.id === selectedSubjectId);
    const subjectName = selectedSubj ? selectedSubj.name : 'Rekap';

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'NIS,Nama Siswa,Rata-rata Tugas,Rata-rata UH,Rata-rata UTS,Rata-rata UAS,Nilai Akhir\n';

    students.forEach(s => {
      const u = users.find(usr => usr.id === s.user_id);
      const name = u ? u.name : 'Unknown';

      const studentGrades = grades.filter(g => g.student_id === s.id && g.subject_id === selectedSubjectId);
      
      const averageTugasGrades = studentGrades.filter(g => g.type === 'tugas');
      const averageUhGrades = studentGrades.filter(g => g.type === 'uh');
      const averageUtsGrades = studentGrades.filter(g => g.type === 'uts');
      const averageUasGrades = studentGrades.filter(g => g.type === 'uas');

      const calcAvgVal = (list: Grade[]) => {
        if (list.length === 0) return 0;
        const sum = list.reduce((acc, curr) => acc + curr.score, 0);
        return Math.round(sum / list.length);
      };

      const avgTugas = calcAvgVal(averageTugasGrades) || '-';
      const avgUh = calcAvgVal(averageUhGrades) || '-';
      const avgUts = calcAvgVal(averageUtsGrades) || '-';
      const avgUas = calcAvgVal(averageUasGrades) || '-';

      const allScores = studentGrades.map(g => g.score);
      const overallAvg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : '-';

      csvContent += `"${s.nis}","${name}","${avgTugas}","${avgUh}","${avgUts}","${avgUas}","${overallAvg}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_${subjectName.replace(/\s+/g, '_')}_Kelas_${teacherClass?.name || 'Kelas'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan Rekap Nilai berhasil diunduh dalam format CSV!');
  };

  const handleDeleteAssignment = (id: string) => {
    if (!window.confirm('Hapus tugas ini?')) return;
    const current = LocalDB.getAssignments().filter(a => a.id !== id);
    LocalDB.setAssignments(current);
    refreshData();
    showToast('Tugas berhasil dihapus.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans" id="teacher-view">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce">
          <CheckCircleIcon className="w-5 h-5" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Nav */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="font-display font-black text-white text-base tracking-wide block">SD MERDEKA</span>
            <span className="text-xs text-blue-400 font-bold tracking-wider uppercase">Portal Guru</span>
          </div>
        </div>

        {/* Teacher profile summary */}
        <div className="p-4 mx-4 my-6 bg-slate-800/50 border border-slate-800 rounded-2xl flex items-center gap-3">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-10 h-10 rounded-full border-2 border-emerald-500 object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden">
            <span className="font-bold text-white text-sm block truncate">{currentUser.name}</span>
            <span className="text-xs text-slate-400 block font-medium capitalize">Guru Kelas {teacherClass?.name || ''}</span>
          </div>
        </div>

        <nav className="grow px-4 space-y-1.5">
          {[
            { id: 'jadwal', label: 'Jadwal Mengajar', icon: Calendar },
            { id: 'absensi', label: 'Presensi / Absensi', icon: UserCheck },
            { id: 'nilai', label: 'Input Nilai Siswa', icon: Award },
            { id: 'tugas', label: 'Kirim Tugas & Materi', icon: FileText },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TeacherTab)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            id="logout-btn-teacher"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-950/30 text-red-400 hover:text-red-300 rounded-xl text-sm font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="grow overflow-y-auto h-screen p-6 sm:p-8">
        
        {/* JADWAL TAB */}
        {activeTab === 'jadwal' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-extrabold text-2xl text-slate-800">Jadwal Mengajar Anda</h1>
                <p className="text-slate-500 text-sm mt-0.5">Sesi mengajar interaktif mingguan yang dijadwalkan.</p>
              </div>
              <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-bold w-max">
                Homeroom / Wali Kelas: Kelas {teacherClass?.name || 'Belum ditugaskan'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schedules.map((sc) => {
                const subj = subjects.find(s => s.id === sc.subject_id);
                const cls = LocalDB.getClasses().find(c => c.id === sc.class_id);
                return (
                  <div key={sc.id} className="bg-white p-6 border border-slate-100 rounded-3xl shadow-xs relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-60"></div>
                    
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
                          Kelas {cls?.name}
                        </span>
                        <h3 className="font-display font-bold text-xl text-slate-800 mt-2">{subj?.name}</h3>
                        <span className="text-xs text-slate-400 font-bold block mt-0.5">Kode: {subj?.code}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-100 text-slate-600 text-xs font-bold">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Hari: {sc.day}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>Jam: {sc.start_time} - {sc.end_time} WIB</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {schedules.length === 0 && (
                <div className="col-span-full bg-white p-12 text-center border border-dashed rounded-3xl text-slate-400 font-bold">
                  Belum ada jadwal mengajar yang dimasukkan oleh Administrator.
                </div>
              )}
            </div>

            {/* Quick stats homeroom class */}
            {teacherClass && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                <h3 className="font-display font-bold text-lg text-slate-800">Siswa Kelas Bimbingan Anda ({teacherClass.name})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {students.map(s => {
                    const u = users.find(usr => usr.id === s.user_id);
                    return (
                      <div key={s.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-center">
                        <img 
                          src={u?.avatar} 
                          alt={u?.name} 
                          className="w-10 h-10 rounded-full mx-auto object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-xs font-bold text-slate-700 block mt-2 truncate">{u?.name}</span>
                        <span className="text-[9px] text-slate-400 font-bold block">{s.nis}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABSENSI TAB */}
        {activeTab === 'absensi' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-extrabold text-2xl text-slate-800">Sistem Presensi Kelas {teacherClass?.name}</h1>
                <p className="text-slate-500 text-sm mt-0.5">Kelola kehadiran murid dengan input manual, rekap bulanan, maupun scan kartu QR Code.</p>
              </div>
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'pencatatan', label: 'Input Manual', icon: UserCheck },
                  { id: 'rekap', label: 'Rekap & Laporan', icon: ListTodo },
                  { id: 'qr_scan', label: 'Scan QR Code', icon: QrCode },
                ].map((subTab) => {
                  const SubIcon = subTab.icon;
                  const isSubActive = attendanceSubTab === subTab.id;
                  return (
                    <button
                      key={subTab.id}
                      onClick={() => setAttendanceSubTab(subTab.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isSubActive ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <SubIcon className="w-3.5 h-3.5" />
                      <span>{subTab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PENCATATAN SUB-TAB */}
            {attendanceSubTab === 'pencatatan' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-blue-700">Tanggal Pencatatan: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold uppercase">Hari Ini</span>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="p-4 sm:p-5">Foto</th>
                          <th className="p-4 sm:p-5">NIS</th>
                          <th className="p-4 sm:p-5">Nama Siswa</th>
                          <th className="p-4 sm:p-5 text-center">Status Kehadiran</th>
                          <th className="p-4 sm:p-5">Keterangan / Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                        {students.map((s) => {
                          const u = users.find(usr => usr.id === s.user_id);
                          const currentStatus = attendanceSheet[s.id] || 'hadir';
                          
                          return (
                            <tr key={s.id} className="hover:bg-slate-50/50">
                              <td className="p-4">
                                <img 
                                  src={u?.avatar} 
                                  alt={u?.name} 
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                  referrerPolicy="no-referrer"
                                />
                              </td>
                              <td className="p-4">
                                <span className="text-slate-800 font-bold block">{s.nis}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-slate-800 font-bold block text-sm">{u?.name}</span>
                              </td>
                              <td className="p-4">
                                <div className="flex justify-center items-center gap-1.5">
                                  {(['hadir', 'sakit', 'izin', 'alpha'] as const).map((stat) => {
                                    const activeColor = 
                                      stat === 'hadir' ? 'bg-emerald-600 text-white shadow-emerald-200' :
                                      stat === 'sakit' ? 'bg-amber-500 text-white shadow-amber-200' :
                                      stat === 'izin' ? 'bg-blue-500 text-white shadow-blue-200' :
                                      'bg-red-500 text-white shadow-red-200';
                                    
                                    const isSelected = currentStatus === stat;

                                    return (
                                      <button
                                        key={stat}
                                        type="button"
                                        onClick={() => setAttendanceSheet(prev => ({ ...prev, [s.id]: stat }))}
                                        className={`px-3 py-1.5 rounded-xl font-bold text-[10px] capitalize tracking-wide transition-all shadow-xs cursor-pointer ${
                                          isSelected ? activeColor : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                        }`}
                                      >
                                        {stat}
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>
                              <td className="p-4">
                                <input 
                                  type="text"
                                  value={attendanceNotes[s.id] || ''}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAttendanceNotes(prev => ({ ...prev, [s.id]: e.target.value }))}
                                  placeholder="Surat dokter / keterangan..."
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-[11px]"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                    <button 
                      onClick={handleSaveAttendance}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan Presensi Hari Ini</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* REKAP SUB-TAB */}
            {attendanceSubTab === 'rekap' && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-2">
                    {(['harian', 'mingguan', 'bulanan'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setRecapMode(mode)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                          recapMode === mode ? 'bg-slate-800 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        Rekap {mode}
                      </button>
                    ))}
                  </div>

                  {recapMode === 'harian' && (
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="text-slate-500">Pilih Tanggal:</span>
                      <input 
                        type="date" 
                        value={recapDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecapDate(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Recap Content */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-6">
                  {/* HARIAN RECAP VIEW */}
                  {recapMode === 'harian' && (
                    <div className="space-y-4">
                      <h3 className="font-display font-black text-lg text-slate-800">Laporan Kehadiran Siswa Hari: {new Date(recapDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                              <th className="p-3">Siswa</th>
                              <th className="p-3">NIS</th>
                              <th className="p-3 text-center">Status Kehadiran</th>
                              <th className="p-3">Catatan Khusus</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {students.map(s => {
                              const u = users.find(usr => usr.id === s.user_id);
                              const record = attendances.find(at => at.student_id === s.id && at.date === recapDate);
                              
                              return (
                                <tr key={s.id} className="hover:bg-slate-50/50 font-semibold">
                                  <td className="p-3 flex items-center gap-2.5">
                                    <img src={u?.avatar} alt={u?.name} className="w-8 h-8 rounded-full object-cover" />
                                    <span className="text-slate-800 block">{u?.name}</span>
                                  </td>
                                  <td className="p-3 font-mono text-slate-500">{s.nis}</td>
                                  <td className="p-3 text-center">
                                    {record ? (
                                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${
                                        record.status === 'hadir' ? 'bg-emerald-50 text-emerald-600' :
                                        record.status === 'sakit' ? 'bg-amber-50 text-amber-600' :
                                        record.status === 'izin' ? 'bg-blue-50 text-blue-600' :
                                        'bg-red-50 text-red-600'
                                      }`}>
                                        {record.status}
                                      </span>
                                    ) : (
                                      <span className="px-2.5 py-1 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-bold">Belum Diabsen</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-slate-500 text-xs italic">{record?.notes || '-'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* MINGGUAN RECAP VIEW */}
                  {recapMode === 'mingguan' && (
                    <div className="space-y-4">
                      <h3 className="font-display font-black text-lg text-slate-800">Tally & Riwayat Kehadiran Mingguan (7 Hari Terakhir)</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                              <th className="p-3">Siswa</th>
                              <th className="p-3 text-center">Kehadiran (H / S / I / A)</th>
                              <th className="p-3 text-center">Tingkat Kehadiran</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {students.map(s => {
                              const u = users.find(usr => usr.id === s.user_id);
                              
                              // Calculate past 7 days records
                              const recs = attendances.filter(at => at.student_id === s.id);
                              const hCount = recs.filter(at => at.status === 'hadir').length;
                              const sCount = recs.filter(at => at.status === 'sakit').length;
                              const iCount = recs.filter(at => at.status === 'izin').length;
                              const aCount = recs.filter(at => at.status === 'alpha').length;
                              const totalAbsen = recs.length;
                              const rate = totalAbsen > 0 ? Math.round((hCount / totalAbsen) * 100) : 100;

                              return (
                                <tr key={s.id} className="hover:bg-slate-50/50 font-semibold">
                                  <td className="p-3 flex items-center gap-2.5">
                                    <img src={u?.avatar} alt={u?.name} className="w-8 h-8 rounded-full object-cover" />
                                    <span className="text-slate-800">{u?.name}</span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <div className="flex justify-center items-center gap-1.5 font-bold">
                                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded" title="Hadir">{hCount} H</span>
                                      <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded" title="Sakit">{sCount} S</span>
                                      <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded" title="Izin">{iCount} I</span>
                                      <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded" title="Alpha">{aCount} A</span>
                                    </div>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className={`font-mono font-black text-sm ${rate > 85 ? 'text-emerald-600' : rate > 70 ? 'text-amber-500' : 'text-red-600'}`}>
                                      {rate}%
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* BULANAN RECAP VIEW */}
                  {recapMode === 'bulanan' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                          <span className="text-[10px] text-emerald-700 font-extrabold uppercase">Kehadiran Kelas Rata-Rata</span>
                          <span className="block text-3xl font-display font-black text-emerald-800 mt-1">94.8%</span>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                          <span className="text-[10px] text-amber-700 font-extrabold uppercase">Sakit & Izin Bulan Ini</span>
                          <span className="block text-3xl font-display font-black text-amber-800 mt-1">3.2%</span>
                        </div>
                        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl">
                          <span className="text-[10px] text-red-700 font-extrabold uppercase">Persentase Alpha / Tanpa Berita</span>
                          <span className="block text-3xl font-display font-black text-red-800 mt-1">2.0%</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tally Kehadiran Kumulatif (Semester Berjalan)</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                                <th className="p-3">Siswa</th>
                                <th className="p-3">Hadir (H)</th>
                                <th className="p-3">Sakit (S)</th>
                                <th className="p-3">Izin (I)</th>
                                <th className="p-3">Alpha (A)</th>
                                <th className="p-3 text-center">Persentase Kehadiran</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {students.map(s => {
                                const u = users.find(usr => usr.id === s.user_id);
                                const recs = attendances.filter(at => at.student_id === s.id);
                                const h = recs.filter(at => at.status === 'hadir').length;
                                const sCount = recs.filter(at => at.status === 'sakit').length;
                                const i = recs.filter(at => at.status === 'izin').length;
                                const a = recs.filter(at => at.status === 'alpha').length;
                                const total = recs.length;
                                const pct = total > 0 ? Math.round(((h + sCount + i) / total) * 100) : 100;

                                return (
                                  <tr key={s.id} className="hover:bg-slate-50/50 font-semibold text-slate-700">
                                    <td className="p-3 flex items-center gap-2.5">
                                      <img src={u?.avatar} alt={u?.name} className="w-8 h-8 rounded-full object-cover" />
                                      <span className="text-slate-800">{u?.name}</span>
                                    </td>
                                    <td className="p-3 text-emerald-600 font-bold">{h} Hari</td>
                                    <td className="p-3 text-amber-500 font-bold">{sCount} Hari</td>
                                    <td className="p-3 text-blue-500 font-bold">{i} Hari</td>
                                    <td className="p-3 text-red-500 font-bold">{a} Hari</td>
                                    <td className="p-3 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                                          <div className="bg-emerald-500 h-full" style={{ width: `${pct}%` }}></div>
                                        </div>
                                        <span className="font-mono text-xs font-black text-slate-800">{pct}%</span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QR-CODE SCAN SUB-TAB */}
            {attendanceSubTab === 'qr_scan' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                  <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-blue-600" />
                    Simulasi Kamera Scan Kartu Siswa
                  </h3>

                  <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center text-center">
                    {/* Glowing scanner frame */}
                    <div className="absolute inset-4 border-2 border-dashed border-blue-500 rounded-xl opacity-60 pointer-events-none"></div>
                    
                    {/* Scanner line animation */}
                    {isQrScanning && (
                      <motion.div 
                        animate={{ top: ['10%', '90%', '10%'] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                        className="absolute left-4 right-4 h-0.5 bg-blue-500 shadow-lg shadow-blue-500 z-10"
                      />
                    )}

                    <div className="space-y-3 z-10 p-4">
                      {isQrScanning ? (
                        <>
                          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-full w-max mx-auto animate-pulse">
                            <Camera className="w-6 h-6 animate-spin" />
                          </div>
                          <span className="text-xs font-bold text-blue-400 tracking-wider uppercase block">Membaca QR Code Siswa...</span>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-slate-800 text-slate-400 rounded-full w-max mx-auto">
                            <Camera className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-bold text-slate-400 block uppercase">Lensa Pemindai Siap Sedia</span>
                          <span className="text-[10px] text-slate-500 block">Arahkan QR Code Kartu Murid ke kamera atau gunakan simulasi manual di bawah.</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Manual Simulation control block */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                      <button
                      type="button"
                      disabled
                      className={`w-full py-3.5 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed transition-all bg-slate-100 text-slate-400`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Fitur Scan QR Disabilkan</span>
                    </button>
                    <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                      Fitur simulasi scan QR dihapus. Absensi dilakukan melalui Input Manual atau Rekap.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-display font-bold text-lg text-slate-800">Petunjuk Penggunaan Fitur Absensi QR</h3>
                  
                  <div className="space-y-4 text-xs text-slate-600 font-medium leading-relaxed">
                    <div className="flex gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl h-max font-bold">1</div>
                      <p>Siswa dapat mengakses dan mencetak/menyimpan kartu identitas QR Code mereka masing-masing dari portal akun siswa.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl h-max font-bold">2</div>
                      <p>Guru menggunakan kamera laptop/handphone di portal ini untuk memindai kartu QR siswa setiap pagi saat memasuki gerbang atau kelas.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl h-max font-bold">3</div>
                      <p>Begitu QR Code terdeteksi, status presensi siswa yang bersangkutan akan langsung terupdate menjadi <strong>Hadir</strong> secara real-time.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-[11px] text-amber-800 font-semibold leading-relaxed mt-4">
                    📢 Siswa dilarang mencatat presensi sendiri. Guru memegang hak kontrol penuh perangkat scanner ini demi integritas rekap absensi sekolah.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NILAI TAB */}
        {activeTab === 'nilai' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-extrabold text-2xl text-slate-800">Evaluasi Belajar Siswa</h1>
                <p className="text-slate-500 text-sm mt-0.5">Berikan penilaian langsung maupun periksa hasil tugas harian siswa yang telah dikirim.</p>
              </div>
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setGradeSubTab('input_manual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    gradeSubTab === 'input_manual' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Input Manual (UH/UTS/UAS)
                </button>
                <button
                  type="button"
                  onClick={() => setGradeSubTab('nilai_tugas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    gradeSubTab === 'nilai_tugas' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Koreksi Tugas Siswa
                </button>
                <button
                  type="button"
                  onClick={() => setGradeSubTab('rekap_nilai')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    gradeSubTab === 'rekap_nilai' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Rekap & Laporan Lulus
                </button>
              </div>
            </div>

            {/* INPUT MANUAL SUB-TAB */}
            {gradeSubTab === 'input_manual' && (
              <div className="space-y-6">
                {/* Filter subject & grade type selection */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pilih Mata Pelajaran</label>
                    <select 
                      value={selectedSubjectId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSubjectId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    >
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jenis Evaluasi</label>
                    <select 
                      value={selectedGradeType}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedGradeType(e.target.value as 'tugas' | 'uh' | 'uts' | 'uas')}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none animate-none"
                    >
                      <option value="tugas">Tugas Harian (Tugas)</option>
                      <option value="uh">Ulangan Harian (UH)</option>
                      <option value="uts">Ujian Tengah Semester (UTS)</option>
                      <option value="uas">Ujian Akhir Semester (UAS)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <div className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 w-full">
                      Nilai yang diinput akan otomatis terupdate di akun siswa & orang tua masing-masing.
                    </div>
                  </div>
                </div>

                {/* Grades Entry sheet card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="p-4 sm:p-5">Foto</th>
                          <th className="p-4 sm:p-5">NIS</th>
                          <th className="p-4 sm:p-5">Nama Siswa</th>
                          <th className="p-4 sm:p-5">Skor Nilai (0 - 100)</th>
                          <th className="p-4 sm:p-5">Catatan / Komentar Guru</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                        {students.map((s) => {
                          const u = users.find(usr => usr.id === s.user_id);
                          return (
                            <tr key={s.id} className="hover:bg-slate-50/50">
                              <td className="p-4">
                                <img 
                                  src={u?.avatar} 
                                  alt={u?.name} 
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                  referrerPolicy="no-referrer"
                                />
                              </td>
                              <td className="p-4">
                                <span className="text-slate-800 font-bold">{s.nis}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-slate-800 font-bold block text-sm">{u?.name}</span>
                              </td>
                              <td className="p-4">
                                <input 
                                  type="number"
                                  min={0}
                                  max={100}
                                  placeholder="E.g. 85"
                                  value={gradesSheet[s.id] || ''}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGradesSheet(prev => ({ ...prev, [s.id]: e.target.value }))}
                                  className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </td>
                              <td className="p-4">
                                <input 
                                  type="text"
                                  placeholder="Tulis pujian atau catatan perbaikan..."
                                  value={gradesNotes[s.id] || ''}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGradesNotes(prev => ({ ...prev, [s.id]: e.target.value }))}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                    <button 
                      onClick={handleSaveGrades}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan & Upload Nilai</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* KOREKSI TUGAS SUB-TAB */}
            {gradeSubTab === 'nilai_tugas' && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 w-full sm:max-w-md">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pilih Tugas Harian untuk Dinilai</label>
                    <select
                      value={gradingAssignmentId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGradingAssignmentId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-bold text-slate-700"
                    >
                      <option value="">-- Silakan Pilih Tugas Harian --</option>
                      {assignments.map(a => {
                        const subj = subjects.find(s => s.id === a.subject_id);
                        return (
                          <option key={a.id} value={a.id}>
                            {subj?.name} - {a.title}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-700 leading-relaxed font-semibold sm:max-w-xs">
                    💡 Pilih salah satu tugas yang sudah Anda kirim sebelumnya untuk melihat tumpukan pengerjaan dari siswa-siswi Anda.
                  </div>
                </div>

                {gradingAssignmentId ? (
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="font-display font-black text-slate-800 text-lg">
                          Daftar Pengumpulan Tugas: {assignments.find(a => a.id === gradingAssignmentId)?.title}
                        </h3>
                        <p className="text-slate-400 text-xs font-medium">Instruksi: klik pada file siswa untuk mengoreksi sebelum memasukkan skor penilaian.</p>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-lg">
                        Total dikirim: {submissions.filter(sub => sub.assignment_id === gradingAssignmentId).length}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                            <th className="p-3">Siswa</th>
                            <th className="p-3">Tgl Mengirim</th>
                            <th className="p-3">File Hasil Tugas</th>
                            <th className="p-3">Koreksi Skor (0-100)</th>
                            <th className="p-3">Umpan Balik Guru</th>
                            <th className="p-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {students.map(s => {
                            const u = users.find(usr => usr.id === s.user_id);
                            // Find submission for this assignment & student
                            const subRecord = submissions.find(sub => sub.assignment_id === gradingAssignmentId && sub.student_id === s.id);
                            
                            return (
                              <tr key={s.id} className="hover:bg-slate-50/50">
                                <td className="p-3 flex items-center gap-2.5">
                                  <img src={u?.avatar} alt={u?.name} className="w-8 h-8 rounded-full object-cover" />
                                  <div>
                                    <span className="text-slate-800 block">{u?.name}</span>
                                    <span className="text-[10px] text-slate-400 block">NIS: {s.nis}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-slate-400 font-mono text-[10px]">
                                  {subRecord ? new Date(subRecord.submitted_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                                </td>
                                <td className="p-3">
                                  {subRecord ? (
                                    <a 
                                      href={subRecord.file_url} 
                                      download={subRecord.file_name}
                                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg inline-flex items-center gap-1 text-[10px] border border-slate-200 transition-colors"
                                      title="Klik untuk download file siswa"
                                    >
                                      <Download className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                      <span className="truncate max-w-30 font-bold">{subRecord.file_name}</span>
                                    </a>
                                  ) : (
                                    <span className="text-red-500 text-[10px] bg-red-50 px-2 py-0.5 rounded font-black">Belum Mengirim</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  {subRecord ? (
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      id={`score-${subRecord.id}`}
                                      defaultValue={subRecord.score !== undefined ? subRecord.score : ''}
                                      placeholder="Skor"
                                      className="w-16 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  ) : (
                                    <span className="text-slate-300 font-normal">-</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  {subRecord ? (
                                    <input
                                      type="text"
                                      id={`notes-${subRecord.id}`}
                                      defaultValue={subRecord.notes || ''}
                                      placeholder="Pujian / catatan koreksi..."
                                      className="w-full min-w-37.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  ) : (
                                    <span className="text-slate-300 font-normal">-</span>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  {subRecord ? (
                                    <div className="flex items-center justify-end gap-1.5">
                                      {subRecord.status === 'dinilai' && (
                                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-bold uppercase shrink-0">Sudah Dinilai</span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const scoreVal = parseInt((document.getElementById(`score-${subRecord.id}`) as HTMLInputElement)?.value);
                                          const notesVal = (document.getElementById(`notes-${subRecord.id}`) as HTMLInputElement)?.value;
                                          handleSaveSubmissionGrade(subRecord.id, scoreVal, notesVal);
                                        }}
                                        className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                                        title="Simpan Penilaian"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-slate-300 font-normal">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-12 text-center rounded-3xl border border-dashed border-slate-200 text-slate-400 font-bold">
                    Pilih tugas harian di atas untuk mulai melihat dan mengoreksi hasil pengerjaan dari siswa.
                  </div>
                )}
              </div>
            )}

            {/* REKAP NILAI SUB-TAB */}
            {gradeSubTab === 'rekap_nilai' && (
              <div className="space-y-6">
                {/* Subject selector and download button */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 w-full sm:max-w-md">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pilih Mata Pelajaran Rekap</label>
                    <select
                      value={selectedSubjectId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSubjectId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-bold text-slate-700"
                    >
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                    </select>
                  </div>

                  <button
                    onClick={handleDownloadRekapGrades}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Rekap Laporan (.CSV)</span>
                  </button>
                </div>

                {/* Rekap Table Card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
                  <div>
                    <h3 className="font-display font-black text-slate-800 text-lg">
                      Laporan Rekapitulasi Nilai & Evaluasi Siswa
                    </h3>
                    <p className="text-slate-400 text-xs font-medium">Berdasarkan data asesmen, tugas harian, dan ujian semester yang tercatat.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse font-sans">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="p-4">Siswa</th>
                          <th className="p-4 text-center">Avg Tugas</th>
                          <th className="p-4 text-center">Avg UH</th>
                          <th className="p-4 text-center">Avg UTS</th>
                          <th className="p-4 text-center">Avg UAS</th>
                          <th className="p-4 text-center">Nilai Akhir</th>
                          <th className="p-4 text-center">Status Kelulusan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {students.map(s => {
                          const u = users.find(usr => usr.id === s.user_id);
                          
                          // Calculate scores
                          const studentGrades = grades.filter(g => g.student_id === s.id && g.subject_id === selectedSubjectId);
                          
                          const averageTugasGrades = studentGrades.filter(g => g.type === 'tugas');
                          const averageUhGrades = studentGrades.filter(g => g.type === 'uh');
                          const averageUtsGrades = studentGrades.filter(g => g.type === 'uts');
                          const averageUasGrades = studentGrades.filter(g => g.type === 'uas');

                          const calcAvgVal = (list: Grade[]) => {
                            if (list.length === 0) return 0;
                            const sum = list.reduce((acc, curr) => acc + curr.score, 0);
                            return Math.round(sum / list.length);
                          };

                          const avgTugas = calcAvgVal(averageTugasGrades);
                          const avgUh = calcAvgVal(averageUhGrades);
                          const avgUts = calcAvgVal(averageUtsGrades);
                          const avgUas = calcAvgVal(averageUasGrades);

                          const allScores = studentGrades.map(g => g.score);
                          const overallAvg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

                          return (
                            <tr key={s.id} className="hover:bg-slate-50/50">
                              <td className="p-4 flex items-center gap-2.5">
                                <img src={u?.avatar} alt={u?.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
                                <div>
                                  <span className="text-slate-800 block text-xs font-bold">{u?.name}</span>
                                  <span className="text-[10px] text-slate-400 block font-bold">NIS: {s.nis}</span>
                                </div>
                              </td>
                              <td className="p-4 text-center font-mono font-bold text-slate-600">{avgTugas || '-'}</td>
                              <td className="p-4 text-center font-mono font-bold text-slate-600">{avgUh || '-'}</td>
                              <td className="p-4 text-center font-mono font-bold text-slate-600">{avgUts || '-'}</td>
                              <td className="p-4 text-center font-mono font-bold text-slate-600">{avgUas || '-'}</td>
                              <td className="p-4 text-center font-mono font-black text-slate-800 text-sm">
                                {overallAvg ? (
                                  <span className={overallAvg >= 75 ? 'text-emerald-600' : 'text-red-600'}>
                                    {overallAvg}
                                  </span>
                                ) : '-'}
                              </td>
                              <td className="p-4 text-center">
                                {!overallAvg ? (
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase">Belum Ada Nilai</span>
                                ) : overallAvg >= 75 ? (
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase">LULUS</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black uppercase">REMIDIAL</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TUGAS TAB */}
        {activeTab === 'tugas' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-extrabold text-2xl text-slate-800">Kirim Tugas & Materi Pembelajaran</h1>
                <p className="text-slate-500 text-sm mt-0.5">Tulis instruksi tugas, PR, ataupun bagikan lembar pengerjaan materi di bawah.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Post New Assignment form */}
              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Buat Tugas Baru
                </h3>

                <form onSubmit={handlePostAssignment} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pilih Ruang Kelas</label>
                    <select 
                      value={selectedClassId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedClassId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    >
                      {LocalDB.getClasses().map(c => <option key={c.id} value={c.id}>Kelas {c.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pilih Mata Pelajaran</label>
                    <select 
                      value={selectedSubjectId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSubjectId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    >
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Judul Tugas / Materi</label>
                    <input 
                      type="text"
                      required
                      value={newAsgTitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAsgTitle(e.target.value)}
                      placeholder="E.g. PR Penjumlahan Menggunakan Gambar 📝"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Lampirkan File Tugas / PDF Soal (Opsional)</label>
                    <div className="flex items-center gap-2">
                      <label className="grow flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer transition-all">
                        <span className="truncate">{newAsgFileName || 'Pilih file PDF, gambar, atau lembar tugas...'}</span>
                        <Upload className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                        <input 
                          type="file" 
                          id="teacher-asg-file"
                          accept=".pdf,image/*"
                          onChange={handleTeacherFileChange}
                          className="hidden"
                        />
                      </label>
                      {newAsgFileName && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewAsgFileName('');
                            setNewAsgFileUrl('');
                            const fileInput = document.getElementById('teacher-asg-file') as HTMLInputElement;
                            if (fileInput) fileInput.value = '';
                          }}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl border border-red-100 transition-all cursor-pointer"
                          title="Hapus lampiran"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tenggat Pengumpulan (Deadline)</label>
                    <input 
                      type="text"
                      required
                      value={newAsgDeadline}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAsgDeadline(e.target.value)}
                      placeholder="YYYY-MM-DD HH:mm"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Instruksi Lengkap Tugas</label>
                    <textarea 
                      required
                      rows={4}
                      value={newAsgDesc}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewAsgDesc(e.target.value)}
                      placeholder="Tuliskan petunjuk pengerjaan di sini secara ramah untuk anak-anak..."
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Terbitkan Tugas</span>
                  </button>
                </form>
              </div>

              {/* Assignments Published list */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-emerald-600" />
                  Daftar Tugas Yang Telah Terbit
                </h3>

                <div className="space-y-4">
                  {assignments.map((asg) => {
                    const cls = LocalDB.getClasses().find(c => c.id === asg.class_id);
                    const subj = subjects.find(s => s.id === asg.subject_id);
                    return (
                      <div key={asg.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 relative group flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-extrabold uppercase">
                              Kelas {cls?.name} • {subj?.name}
                            </span>
                            <span className="text-[10px] text-red-600 font-bold">⏰ Deadline: {asg.deadline}</span>
                          </div>

                          <h4 className="font-display font-bold text-slate-800 text-base">{asg.title}</h4>
                          <p className="text-slate-500 text-xs leading-relaxed">{asg.description}</p>
                          
                          {asg.file_name && (
                            <div className="pt-2">
                              <a
                                href={asg.file_url}
                                download={asg.file_name}
                                className="px-3 py-2 bg-white text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs hover:bg-slate-100 transition-colors"
                              >
                                <Download className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Download Lampiran: {asg.file_name}</span>
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-1.5 mt-5 pt-3 border-t border-slate-200/50">
                          <button 
                            onClick={() => handleDeleteAssignment(asg.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus tugas"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {assignments.length === 0 && (
                    <div className="p-8 text-center border border-dashed rounded-2xl text-slate-400 font-bold">
                      Belum ada materi atau tugas yang Anda terbitkan.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Simple icons wrappers
function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
