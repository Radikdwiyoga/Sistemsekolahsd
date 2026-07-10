import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, LogOut, Heart, Phone, MapPin, CheckCircle, 
  DollarSign, AlertCircle, Calendar, Send, User, MessageSquare,
  Download, Upload, X
} from 'lucide-react';
import { LocalDB } from '../lib/db';
import { 
  User as DBUser, Student, Parent, SchoolClass, Grade, 
  Attendance, Payment, Announcement, Teacher 
} from '../types/database';

interface ParentDashboardProps {
  currentUser: DBUser;
  onLogout: () => void;
}

export default function ParentDashboard({ currentUser, onLogout }: ParentDashboardProps) {
  // DB States
  const [parent, setParent] = useState<Parent | null>(null);
  const [child, setChild] = useState<Student | null>(null);
  const [childUser, setChildUser] = useState<DBUser | null>(null);
  const [childClass, setChildClass] = useState<SchoolClass | null>(null);
  const [homeroomTeacherUser, setHomeroomTeacherUser] = useState<DBUser | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // SPP payment helper state
  const [paymentToast, setPaymentToast] = useState('');

  // Simulated Chat Box State
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'parent' | 'teacher'; text: string; time: string }>>([
    { sender: 'teacher', text: 'Selamat datang di Ruang Konsultasi Wali Murid. Ada yang bisa saya bantu terkait perkembangan anak Anda?', time: '08:30' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const refreshData = () => {
    const allParents = LocalDB.getParents();
    const allStudents = LocalDB.getStudents();
    const allUsers = LocalDB.getUsers();
    const allClasses = LocalDB.getClasses();
    const allTeachers = LocalDB.getTeachers();
    const allGrades = LocalDB.getGrades();
    const allAttendances = LocalDB.getAttendances();
    const allPayments = LocalDB.getPayments();
    const allAnn = LocalDB.getAnnouncements();

    setAnnouncements(allAnn.filter(a => a.target_role === 'semua' || a.target_role === 'wali'));

    // Find parent record
    const prnt = allParents.find(p => p.user_id === currentUser.id);
    if (prnt) {
      setParent(prnt);

      // Find child associated with this parent
      const chld = allStudents.find(s => s.parent_id === prnt.id);
      if (chld) {
        setChild(chld);

        // Find child user account
        const chldUser = allUsers.find(u => u.id === chld.user_id);
        setChildUser(chldUser || null);

        // Find child class
        const cls = allClasses.find(c => c.id === chld.class_id);
        if (cls) {
          setChildClass(cls);

          // Find homeroom teacher
          const teach = allTeachers.find(t => t.id === cls.homeroom_teacher_id);
          if (teach) {
            const teachUser = allUsers.find(u => u.id === teach.user_id);
            setHomeroomTeacherUser(teachUser || null);
          }
        }

        // Get child grades
        const chldGrades = allGrades.filter(g => g.student_id === chld.id);
        setGrades(chldGrades);

        // Get child attendances
        const chldAtnd = allAttendances.filter(a => a.student_id === chld.id);
        setAttendances(chldAtnd);

        // Get child payments
        const chldPay = allPayments.filter(p => p.student_id === chld.id);
        setPayments(chldPay);
      }
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Parent state for selected files
  const [selectedProofFiles, setSelectedProofFiles] = useState<Record<string, { name: string; url: string }>>({});

  const handleProofFileChange = (paymentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedProofFiles(prev => ({
        ...prev,
        [paymentId]: {
          name: file.name,
          url: event.target?.result as string
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  // Pay SPP simulator with Proof of Payment
  const handlePaySPP = (paymentId: string, month: string) => {
    const fileInfo = selectedProofFiles[paymentId];
    if (!fileInfo) {
      alert('Silakan pilih file bukti transfer Anda terlebih dahulu!');
      return;
    }

    const currentPayments = LocalDB.getPayments();
    const idx = currentPayments.findIndex(p => p.id === paymentId);
    if (idx !== -1) {
      currentPayments[idx] = {
        ...currentPayments[idx],
        status: 'proses_verifikasi',
        paid_at: new Date().toISOString(),
        proof_file_name: fileInfo.name,
        proof_file_url: fileInfo.url
      };
      LocalDB.setPayments(currentPayments);
      
      // Clear local selection
      setSelectedProofFiles(prev => {
        const copy = { ...prev };
        delete copy[paymentId];
        return copy;
      });

      refreshData();

      // Show receipt banner
      setPaymentToast(`Bukti pembayaran SPP ${month} berhasil dikirim! Menunggu verifikasi tata usaha/admin.`);
      setTimeout(() => setPaymentToast(''), 3000);
    }
  };

  // Simulated Wali Kelas Chat
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const timeString = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const newHistory = [...chatHistory, { sender: 'parent' as const, text: chatMessage, time: timeString }];
    setChatHistory(newHistory);
    const parentQuery = chatMessage;
    setChatMessage('');

    // Trigger auto typing response after 1.5 seconds
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let replyText = `Terima kasih atas pesan Anda Bapak/Ibu. Terkait "${parentQuery}", kami senantiasa memantau pengerjaan tugas di kelas. Sejauh ini ananda aktif belajar dan ceria di sekolah.`;
      
      if (parentQuery.toLowerCase().includes('nilai') || parentQuery.toLowerCase().includes('rapor')) {
        replyText = `Nilai rapor dan evaluasi harian ananda sudah kami input ke sistem portal ini. Silakan dicek di menu "Ringkasan Akademis" di atas. Secara umum perkembangannya sangat bagus!`;
      } else if (parentQuery.toLowerCase().includes('sakit') || parentQuery.toLowerCase().includes('izin')) {
        replyText = `Baik Bapak/Ibu, terima kasih atas konfirmasinya. Presensi ananda di kelas sudah kami sesuaikan. Semoga ananda lekas sehat kembali dan bisa bergabung kembali bersama teman-teman.`;
      }

      setChatHistory(prev => [...prev, { sender: 'teacher' as const, text: replyText, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1500);
  };

  // Helper Attendance calculations
  const totalDays = attendances.length || 1;
  const countHadir = attendances.filter(a => a.status === 'hadir').length;
  const countSakit = attendances.filter(a => a.status === 'sakit').length;
  const countIzin = attendances.filter(a => a.status === 'izin').length;
  const countAlpha = attendances.filter(a => a.status === 'alpha').length;

  const attendanceRate = Math.round((countHadir / totalDays) * 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-16 font-sans flex flex-col" id="parent-view">
      
      {/* SPP Payment success banner */}
      {paymentToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-bold">{paymentToast}</span>
        </div>
      )}

      {/* Mobile first Layout Container */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="font-display font-black text-slate-800 text-base tracking-tight block">SD MERDEKA</span>
            <span className="text-[10px] text-blue-600 font-bold uppercase block tracking-wider">Portal Wali Murid</span>
          </div>
        </div>

        <button 
          id="logout-btn-parent"
          onClick={onLogout}
          className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors cursor-pointer"
          title="Keluar Portal"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* Child general profile summary */}
        <section className="bg-linear-to-br from-blue-600 to-indigo-700 text-white p-6 sm:p-8 rounded-3xl shadow-md relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[16px_16px]"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <img 
                src={childUser?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kiki'} 
                alt={childUser?.name} 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white/20 object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="px-2.5 py-0.5 bg-yellow-400 text-slate-900 text-[9px] font-black uppercase rounded-full">
                  Siswa: Kelas {childClass?.name}
                </span>
                <h2 className="font-display font-black text-xl sm:text-2xl mt-1">{childUser?.name || 'Anak Anda'}</h2>
                <span className="text-xs text-blue-100 font-medium block mt-0.5">NIS: {child?.nis} • NISN: {child?.nisn}</span>
              </div>
            </div>

            {/* Homeroom teacher reference */}
            <div className="bg-white/10 backdrop-blur border border-white/10 p-3 rounded-2xl shrink-0 w-full sm:w-auto text-left">
              <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">Wali Kelas</span>
              <span className="font-bold text-white text-sm block mt-0.5">👩‍🏫 {homeroomTeacherUser?.name || 'Pak Budi'}</span>
              <span className="text-[10px] text-blue-100 block font-semibold">Hubungi: {homeroomTeacherUser?.phone}</span>
            </div>
          </div>
        </section>

        {/* Ringkasan Performa Anak Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Attendance Stats Chart (Kehadiran) */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
              <span className="text-xl">📅</span>
              Ringkasan Kehadiran Anak
            </h3>

            <div className="flex items-center gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center shrink-0">
                <span className="text-[10px] font-bold text-slate-400 block">Rasio Masuk</span>
                <span className="font-display font-black text-3xl text-emerald-600 block mt-0.5">{attendanceRate}%</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                Ananda tercatat rajin menghadiri kelas tepat waktu. Di bawah merupakan rekapitulasi status kehadiran semester ganjil.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                { label: 'Hadir Tepat Waktu', count: countHadir, pct: Math.round((countHadir/totalDays)*100), color: 'bg-emerald-500' },
                { label: 'Sakit (Surat Dokter)', count: countSakit, pct: Math.round((countSakit/totalDays)*100), color: 'bg-amber-500' },
                { label: 'Izin Bermohon', count: countIzin, pct: Math.round((countIzin/totalDays)*100), color: 'bg-blue-500' },
                { label: 'Alpha (Tanpa Kabar)', count: countAlpha, pct: Math.round((countAlpha/totalDays)*100), color: 'bg-red-500' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <span>{item.label}</span>
                    <span>{item.count} Hari ({isNaN(item.pct) ? 0 : item.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full`} style={{ width: `${isNaN(item.pct) ? 0 : item.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Academic Grades summary (Nilai Akademis) */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
              <span className="text-xl">🏆</span>
              Rata-Rata Nilai Mata Pelajaran
            </h3>

            <p className="text-slate-500 text-xs leading-relaxed">
              Berikut grafik nilai tugas dan ulangan terbaru ananda di kelas. Kriteria Ketuntasan Minimal (KKM) sekolah adalah 75.
            </p>

            <div className="space-y-4 pt-2">
              {grades.map((gr, idx) => {
                const subj = LocalDB.getSubjects().find(s => s.id === gr.subject_id);
                const score = gr.score;
                const progressColor = score >= 90 ? 'bg-yellow-500' : score >= 80 ? 'bg-blue-600' : 'bg-amber-600';
                
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block">{subj?.name || 'Akademik'}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{gr.type} - {gr.notes.substring(0, 30)}...</span>
                      </div>
                      <span className="font-display font-black text-slate-800 text-base">{score}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${progressColor} h-full rounded-full`} style={{ width: `${score}%` }}></div>
                    </div>
                  </div>
                );
              })}

              {grades.length === 0 && (
                <div className="p-8 text-center text-slate-400 font-bold bg-slate-50 rounded-2xl text-xs">
                  Belum ada nilai terinput semester ini.
                </div>
              )}
            </div>
          </section>

        </div>

        {/* SPP Payment Panel (Tagihan SPP) */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
          <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
            <span className="text-xl">💳</span>
            Info Keuangan & Tagihan SPP Bulanan
          </h3>

          <div className="divide-y divide-slate-100">
            {payments.map((pay) => {
              const isPaid = pay.status === 'lunas';
              const selectedFile = selectedProofFiles[pay.id];

              return (
                <div key={pay.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 grow">
                    <span className="font-bold text-slate-800 text-sm block">Iuran SPP Sekolah - Bulan {pay.month}</span>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Rp {pay.amount.toLocaleString('id-ID')}</span>
                      {isPaid && pay.paid_at && (
                        <span className="text-[10px] text-slate-400 font-semibold block">Dibayar pada {new Date(pay.paid_at).toLocaleDateString('id-ID')}</span>
                      )}
                    </div>
                    {isPaid && pay.proof_file_name && (
                      <div className="pt-1">
                        <a 
                          href={pay.proof_file_url} 
                          download={pay.proof_file_name}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] inline-flex items-center gap-1 border border-slate-200 transition-colors font-bold"
                          title="Klik untuk mengunduh bukti transfer Anda"
                        >
                          <Download className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="max-w-50 truncate">Bukti: {pay.proof_file_name}</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0 self-start md:self-center">
                    {pay.status === 'belum_lunas' && (
                      <div className="flex flex-col gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 max-w-xs">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Unggah Bukti Transfer (PDF/Foto)</label>
                        <div className="flex items-center gap-1.5">
                          <label className="grow flex items-center justify-between px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 cursor-pointer transition-colors max-w-37.5">
                            <span className="truncate">{selectedFile?.name || 'Pilih File...'}</span>
                            <Upload className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                            <input 
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleProofFileChange(pay.id, e)}
                              className="hidden"
                            />
                          </label>
                          {selectedFile && (
                            <button
                              type="button"
                              onClick={() => setSelectedProofFiles(prev => {
                                const copy = { ...prev };
                                delete copy[pay.id];
                                return copy;
                              })}
                              className="p-1.5 bg-red-50 text-red-500 border border-red-100 rounded-lg"
                              title="Batalkan"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        pay.status === 'lunas' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : pay.status === 'proses_verifikasi'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {pay.status === 'lunas' ? 'LUNAS' : pay.status === 'proses_verifikasi' ? 'VERIFIKASI' : 'BELUM BAYAR'}
                      </span>

                      {pay.status === 'belum_lunas' && (
                        <button 
                          onClick={() => handlePaySPP(pay.id, pay.month)}
                          disabled={!selectedFile}
                          className={`px-3.5 py-2 font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer ${
                            selectedFile 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100' 
                              : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                          }`}
                        >
                          Kirim & Bayar SPP
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interactive Chat Consulting with Wali Kelas */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
            <span className="text-xl">💬</span>
            Ruang Diskusi & Konsultasi Wali Kelas
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Butuh berkonsultasi terkait kemajuan ananda? Kirim pesan langsung kepada bapak/ibu guru kelas di sini untuk simulasi konsultasi cepat.
          </p>

          <div className="bg-slate-50 border border-slate-150 rounded-2xl overflow-hidden flex flex-col h-80 mt-4">
            {/* Chat list bubble */}
            <div className="grow p-4 overflow-y-auto space-y-3 flex flex-col">
              {chatHistory.map((chat, idx) => {
                const isParent = chat.sender === 'parent';
                return (
                  <div 
                    key={idx} 
                    className={`max-w-[75%] p-3 rounded-2xl text-xs space-y-1 ${
                      isParent 
                        ? 'bg-blue-600 text-white rounded-br-none self-end' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none self-start'
                    }`}
                  >
                    <p className="leading-relaxed">{chat.text}</p>
                    <span className={`text-[9px] block text-right font-medium ${isParent ? 'text-blue-200' : 'text-slate-400'}`}>
                      {chat.time}
                    </span>
                  </div>
                );
              })}

              {isTyping && (
                <div className="bg-white border border-slate-200 p-2.5 rounded-2xl rounded-bl-none self-start max-w-[50%] flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                </div>
              )}
            </div>

            {/* Chat Form message sender */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-150 flex gap-2">
              <input 
                type="text"
                placeholder="Ketik pertanyaan untuk wali kelas..."
                value={chatMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatMessage(e.target.value)}
                className="grow px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button 
                type="submit"
                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>

        {/* School Notices for Guardians */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
          <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
            <span className="text-xl">📣</span>
            Surat Edaran & Pengumuman Sekolah
          </h3>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100/60 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                  <span>SD MERDEKA NEWS</span>
                  <span>{new Date(ann.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                </div>
                <h4 className="font-display font-bold text-sm text-slate-800">{ann.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
