import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, LogOut, Calendar, Clock, Star, Smile, Sparkles, 
  CheckCircle, FileText, Megaphone, HelpCircle, GraduationCap,
  QrCode, Printer, Download, Upload, X, ShieldCheck
} from 'lucide-react';
import { LocalDB } from '../lib/db';
import { User, Student, SchoolClass, Subject, Schedule, Grade, Assignment, Announcement, Submission } from '../types/database';

interface StudentDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

export default function StudentDashboard({ currentUser, onLogout }: StudentDashboardProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [studentClass, setStudentClass] = useState<SchoolClass | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [studentSubmissions, setStudentSubmissions] = useState<Submission[]>([]);

  // Simulation state for completed homework IDs
  const [completedAsgs, setCompletedAsgs] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, { name: string; url: string }>>({});
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const [celebrateText, setCelebrateText] = useState('');

  const refreshData = () => {
    const allStudents = LocalDB.getStudents();
    const allClasses = LocalDB.getClasses();
    const allSchedules = LocalDB.getSchedules();
    const allSubjects = LocalDB.getSubjects();
    const allAssignments = LocalDB.getAssignments();
    const allGrades = LocalDB.getGrades();
    const allAnn = LocalDB.getAnnouncements();
    const allSubmissions = LocalDB.getSubmissions();

    setSubjects(allSubjects);
    setAnnouncements(allAnn.filter(a => a.target_role === 'semua' || a.target_role === 'siswa'));

    // Find student record associated with user
    const currentStud = allStudents.find(s => s.user_id === currentUser.id);
    if (currentStud) {
      setStudent(currentStud);
      
      // Filter submissions for this student
      const mySubms = allSubmissions.filter(sub => sub.student_id === currentStud.id);
      setStudentSubmissions(mySubms);
      
      // Sync completed assignments based on real submission records
      const submittedIds = mySubms.map(s => s.assignment_id);
      setCompletedAsgs(submittedIds);

      // Find class
      const cls = allClasses.find(c => c.id === currentStud.class_id);
      if (cls) {
        setStudentClass(cls);

        // Filter schedules for this class
        const classScheds = allSchedules.filter(s => s.class_id === cls.id);
        setSchedules(classScheds);

        // Filter assignments for this class
        const classAsgs = allAssignments.filter(a => a.class_id === cls.id);
        setAssignments(classAsgs);
      }

      // Filter grades for this student
      const studGrades = allGrades.filter(g => g.student_id === currentStud.id);
      setGrades(studGrades);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleStudentFileChange = (asgId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFiles(prev => ({
        ...prev,
        [asgId]: {
          name: file.name,
          url: event.target?.result as string
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCompleteTask = (asgId: string, asgTitle: string) => {
    if (completedAsgs.includes(asgId)) return;

    const fileInfo = selectedFiles[asgId];
    if (!fileInfo) {
      alert('Silakan pilih file jawaban tugas Anda terlebih dulu (PDF atau Gambar)!');
      return;
    }

    // Generate and append real submission
    const newSubm: Submission = {
      id: `subm-${asgId}-${currentUser.id}-${Date.now()}`,
      assignment_id: asgId,
      student_id: student?.id || 's-unknown',
      student_name: currentUser.name,
      file_name: fileInfo.name,
      file_url: fileInfo.url,
      submitted_at: new Date().toISOString(),
      status: 'dikirim'
    };

    const allSubms = LocalDB.getSubmissions();
    allSubms.push(newSubm);
    LocalDB.setSubmissions(allSubms);

    // Sync state
    setSelectedFiles(prev => {
      const updated = { ...prev };
      delete updated[asgId];
      return updated;
    });

    setCelebrateText(`Hebat! Tugas "${asgTitle.substring(0, 15)}..." Berhasil Dikirim! 🚀✨`);
    setIsConfettiActive(true);
    setTimeout(() => {
      setIsConfettiActive(false);
    }, 4000);

    refreshData();
  };

  // Helper to trigger printing of the student identity QR code
  const handlePrintQRCode = () => {
    window.print();
  };

  // Helper to calculate total stars from grades
  const getStarsCount = () => {
    if (grades.length === 0) return 3; // Default starting stars
    const avg = grades.reduce((acc, curr) => acc + curr.score, 0) / grades.length;
    if (avg >= 90) return 5;
    if (avg >= 80) return 4;
    return 3;
  };

  const currentStars = getStarsCount();

  return (
    <div className="min-h-screen bg-amber-50/40 pb-16 font-sans relative overflow-x-hidden" id="student-view">
      
      {/* Visual Star celebration popup */}
      {isConfettiActive && (
        <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500 text-slate-900 px-6 py-4 rounded-3xl shadow-2xl border-4 border-white flex items-center gap-3 animate-bounce">
          <Smile className="w-8 h-8 text-slate-900 animate-spin" />
          <div className="font-display font-black text-xs sm:text-sm">
            <span>{celebrateText}</span>
            <span className="block text-[10px] text-slate-700 mt-0.5">Guru akan segera memeriksanya! 👩‍🏫🌟</span>
          </div>
        </div>
      )}

      {/* Playful Kids Header Banner */}
      <header className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white rounded-b-[40px] shadow-lg relative overflow-hidden">
        {/* Childish background sparkles */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:20px_20px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-yellow-300 object-cover shadow-md"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-900 text-xs font-black p-1.5 rounded-full shadow-md flex items-center justify-center">
                🎒
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="bg-yellow-300 text-slate-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Kelas {studentClass?.name || '1A'}
                </span>
                <span className="text-yellow-200 text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current text-yellow-300" />
                  Siswa Aktif
                </span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-white leading-tight">
                Halo, {currentUser.name}! 👋✨
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm font-semibold">
                Semangat belajar hari ini! Jangan lupa berdoa ya anak pintar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stars counter widget */}
            <div className="bg-white/10 backdrop-blur px-4 py-3 rounded-2xl border border-white/20 text-center flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <div>
                <span className="text-[9px] text-blue-200 font-bold uppercase tracking-wider block">Bintang Belajarku</span>
                <div className="flex gap-0.5 justify-center mt-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < currentStars ? 'fill-current text-yellow-300' : 'text-white/20'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>

            <button 
              id="logout-btn-student"
              onClick={onLogout}
              className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl shadow-md transition-colors cursor-pointer"
              title="Keluar Portal"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Schedules & Grades (Visual & Large) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Today's Schedule (Child Friendly Card list) */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-lg sm:text-xl text-slate-800 flex items-center gap-2">
                <span className="text-2xl">📅</span>
                Jadwal Belajar Hari Ini
              </h3>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                Hari Ini
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {schedules.map((sc, idx) => {
                const subj = subjects.find(s => s.id === sc.subject_id);
                // Beautiful pastel background mappings for kids
                const colorPalettes = [
                  'bg-emerald-50 border-emerald-100 text-emerald-800 hover:bg-emerald-100/50',
                  'bg-pink-50 border-pink-100 text-pink-800 hover:bg-pink-100/50',
                  'bg-purple-50 border-purple-100 text-purple-800 hover:bg-purple-100/50',
                  'bg-blue-50 border-blue-100 text-blue-800 hover:bg-blue-100/50'
                ];
                const palette = colorPalettes[idx % colorPalettes.length];

                return (
                  <div 
                    key={sc.id} 
                    className={`p-5 rounded-2xl border border-solid transition-all transform hover:-translate-y-0.5 shadow-xs flex flex-col justify-between ${palette}`}
                  >
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-white/60 px-2 py-0.5 rounded-full">
                        Sesi {idx + 1}
                      </span>
                      <h4 className="font-display font-black text-lg mt-2 leading-snug">{subj?.name}</h4>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-3 text-[11px] font-bold opacity-80 pt-3 border-t border-black/5">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{sc.start_time} - {sc.end_time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {schedules.length === 0 && (
                <div className="col-span-full p-8 text-center text-slate-400 font-bold bg-slate-50 rounded-2xl">
                  Hari ini tidak ada sesi tatap muka kelas. 🎈
                </div>
              )}
            </div>
          </section>

          {/* Kids Grades Dashboard (Nilai Belajarku) */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-100 shadow-sm space-y-6">
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-800 flex items-center gap-2">
              <span className="text-2xl">🏅</span>
              Papan Bintang Nilai Belajarku
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {grades.map((gr) => {
                const subj = subjects.find(s => s.id === gr.subject_id);
                // Custom feedback messages for kids
                const isExcellent = gr.score >= 90;
                const isGood = gr.score >= 80;
                
                const emoji = isExcellent ? '🌟 Hebat!' : isGood ? '👍 Bagus!' : '💪 Semangat!';
                const bgBorder = isExcellent ? 'border-yellow-200 bg-yellow-50/50' : isGood ? 'border-blue-100 bg-blue-50/40' : 'border-slate-200 bg-slate-50/50';

                return (
                  <div key={gr.id} className={`p-4 sm:p-5 rounded-2xl border ${bgBorder} flex justify-between items-center gap-4`}>
                    <div className="space-y-1.5 overflow-hidden">
                      <span className="px-2 py-0.5 bg-white/80 border border-slate-200/50 text-[9px] text-slate-500 font-bold uppercase rounded-md">
                        {gr.type} • {subj?.code}
                      </span>
                      <h4 className="font-display font-bold text-slate-800 text-sm truncate">{subj?.name}</h4>
                      <p className="text-[10px] text-slate-500 italic line-clamp-1">" {gr.notes} "</p>
                    </div>

                    <div className="text-center shrink-0">
                      <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">SKOR</span>
                      <span className="font-display font-black text-3xl text-blue-600 block leading-none my-1">{gr.score}</span>
                      <span className="text-[9px] font-black text-amber-600 bg-yellow-100 px-2 py-0.5 rounded-full whitespace-nowrap block">
                        {emoji}
                      </span>
                    </div>
                  </div>
                );
              })}

              {grades.length === 0 && (
                <div className="col-span-full p-8 text-center text-slate-400 font-bold bg-slate-50 rounded-2xl">
                  Nilai belajar belum dimasukkan oleh Bapak/Ibu guru. 📚
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Right Column: Homework/Tugas & Illustrated Announcements */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Homework Checklist (Interactive) */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-100 shadow-sm space-y-6">
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-800 flex items-center gap-2">
              <span className="text-2xl">✏️</span>
              Tugas Sekolah Ku (PR)
            </h3>

            <div className="space-y-4">
              {assignments.map((asg) => {
                const subj = subjects.find(s => s.id === asg.subject_id);
                // Find submission for this assignment
                const subRecord = studentSubmissions.find(sub => sub.assignment_id === asg.id);
                const isCompleted = !!subRecord;

                return (
                  <div 
                    key={asg.id} 
                    className={`p-5 rounded-2xl border transition-all ${
                      isCompleted 
                        ? 'bg-emerald-50/50 border-emerald-100 text-slate-500' 
                        : 'bg-white border-slate-100 shadow-xs'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-extrabold uppercase">
                          {subj?.name}
                        </span>
                        <h4 className={`font-display font-bold text-sm mt-1.5 ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {asg.title}
                        </h4>
                      </div>
                      
                      {isCompleted && (
                        <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                          Selesai ✨
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      {asg.description}
                    </p>

                    {/* Download Teacher's Task Attachment if present */}
                    {asg.file_name && (
                      <div className="mt-3">
                        <a
                          href={asg.file_url}
                          download={asg.file_name}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] inline-flex items-center gap-1.5 font-bold transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Soal: {asg.file_name}</span>
                        </a>
                      </div>
                    )}

                    {/* Submission / Grading details */}
                    {isCompleted ? (
                      <div className="mt-4 p-3 bg-white rounded-xl border border-emerald-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-bold">Jawaban Anda:</span>
                          <a 
                            href={subRecord.file_url} 
                            download={subRecord.file_name}
                            className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                          >
                            <Download className="w-3 h-3" />
                            <span>{subRecord.file_name}</span>
                          </a>
                        </div>

                        {subRecord.status === 'dinilai' ? (
                          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-2.5 rounded-lg border border-yellow-200/80 mt-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-extrabold text-[10px] text-amber-700 tracking-wider uppercase flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Nilai dari Guru
                              </span>
                              <span className="text-xl font-black text-blue-600">{subRecord.score} / 100</span>
                            </div>
                            {subRecord.notes && (
                              <p className="text-[10px] text-slate-600 italic">" {subRecord.notes} "</p>
                            )}
                          </div>
                        ) : (
                          <div className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1.5 rounded-lg font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Menunggu pemeriksaan & penilaian guru</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Unggah Jawaban Tugas Anda (PDF/Gambar)</label>
                        <div className="flex items-center gap-1.5">
                          <label className="flex-grow flex items-center justify-between px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 cursor-pointer transition-colors">
                            <span className="truncate max-w-[150px]">{selectedFiles[asg.id]?.name || 'Pilih File Jawaban...'}</span>
                            <Upload className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
                            <input 
                              type="file"
                              accept=".pdf,image/*"
                              onChange={(e) => handleStudentFileChange(asg.id, e)}
                              className="hidden"
                            />
                          </label>
                          {selectedFiles[asg.id] && (
                            <button
                              type="button"
                              onClick={() => setSelectedFiles(prev => {
                                const copy = { ...prev };
                                delete copy[asg.id];
                                return copy;
                              })}
                              className="p-2 bg-red-50 text-red-500 border border-red-100 rounded-lg"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100/50 flex items-center justify-between gap-4">
                      <span className="text-[9px] text-red-500 font-bold whitespace-nowrap">⏰ Batas: {asg.deadline}</span>
                      
                      {!isCompleted && (
                        <button 
                          onClick={() => handleCompleteTask(asg.id, asg.title)}
                          disabled={!selectedFiles[asg.id]}
                          className={`px-4 py-2 font-bold rounded-xl text-[10px] flex items-center gap-1 transition-all transform active:scale-95 shadow-md shadow-yellow-100 cursor-pointer ${
                            selectedFiles[asg.id]
                              ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-900'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                          }`}
                        >
                          <span>Kirim Tugas 🚀</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {assignments.length === 0 && (
                <div className="p-8 text-center border border-dashed rounded-2xl text-slate-400 font-bold">
                  Yey! Bebas PR hari ini. Selamat bersantai! 🎉
                </div>
              )}
            </div>
          </section>

          {/* Student QR Identity Card for Attendance scanning */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-md space-y-5 print:border-none print:shadow-none" id="qr-id-card-section">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-lg text-slate-800 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-600" />
                Kartu QR Presensi Mandiri
              </h3>
              <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">Siswa ID</span>
            </div>

            <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
              Siswa wajib mencetak atau menunjukkan Kartu QR ini ke perangkat Guru di kelas untuk pencatatan presensi harian otomatis.
            </p>

            {/* Print Container */}
            <div className="p-5 bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-50/40 rounded-2xl border-2 border-dashed border-indigo-200 relative overflow-hidden flex flex-col items-center text-center">
              {/* Decorative design elements */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-indigo-500"></div>
              
              <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4">SD NEGERI MERDEKA</div>
              
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-300 shadow-xs mb-2"
                referrerPolicy="no-referrer"
              />

              <div className="font-display font-black text-sm text-indigo-900">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500 font-bold">NIS: {student?.nis || 'N/A'} • Kelas: {studentClass?.name || '1-A'}</div>

              {/* Vector Simulated QR code rendering */}
              <div className="bg-white p-3.5 rounded-xl border-2 border-indigo-100 shadow-xs my-4 inline-block">
                <div className="grid grid-cols-5 gap-1 w-24 h-24 bg-white p-1">
                  {/* Position detection pattern top-left */}
                  <div className="bg-indigo-900 rounded-xs"></div>
                  <div className="bg-indigo-900 rounded-xs"></div>
                  <div className="bg-indigo-900 rounded-xs"></div>
                  <div className="bg-slate-100 rounded-xs"></div>
                  <div className="bg-indigo-900 rounded-xs"></div>

                  {/* Position detection pattern top-right */}
                  <div className="bg-indigo-900 rounded-xs"></div>
                  <div className="bg-slate-100 rounded-xs"></div>
                  <div className="bg-indigo-900 rounded-xs"></div>
                  <div className="bg-indigo-900 rounded-xs"></div>
                  <div className="bg-indigo-900 rounded-xs"></div>

                  <div className="bg-indigo-900 rounded-xs"></div>
                  <div className="bg-indigo-900 rounded-xs"></div>
                  <div className="bg-slate-100 rounded-xs"></div>
                  <div className="bg-slate-100 rounded-xs"></div>
                  <div className="bg-indigo-900 rounded-xs"></div>

                  {/* Position detection pattern bottom-left */}
                  <div className="bg-indigo-900 rounded-xs"></div>
                  <div className="bg-slate-100 rounded-xs"></div>
                  <div className="bg-indigo-900 rounded-xs"></div>
                  <div className="bg-indigo-900 rounded-xs"></div>
                  <div className="bg-slate-100 rounded-xs"></div>

                  <div className="bg-indigo-900 rounded-xs"></div>
                  <div className="bg-indigo-900 rounded-xs"></div>
                  <div className="bg-indigo-900 rounded-xs"></div>
                  <div className="bg-slate-100 rounded-xs"></div>
                  <div className="bg-indigo-900 rounded-xs"></div>
                </div>
              </div>

              <span className="text-[9px] font-mono text-slate-400 tracking-wider">SECURE-ID: {student?.id || 'STUDENT_UNVERIFIED'}</span>
            </div>

            <button
              onClick={handlePrintQRCode}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-100 cursor-pointer print:hidden"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kartu QR Saya 🖨️</span>
            </button>
          </section>

          {/* Illustrated Mading / Announcements for Kids */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-100 shadow-sm space-y-6">
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-800 flex items-center gap-2">
              <span className="text-2xl">📣</span>
              Mading Sekolah Hari Ini
            </h3>

            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-xs flex flex-col">
                  {ann.image_url && (
                    <img 
                      src={ann.image_url} 
                      alt={ann.title} 
                      className="h-32 w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="p-4 space-y-2">
                    <span className="text-[8px] text-slate-400 font-bold uppercase block">
                      Diterbitkan: {new Date(ann.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                    <h4 className="font-display font-bold text-sm text-slate-800 leading-snug">{ann.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{ann.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
