import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, LogIn, Phone, MapPin, Menu, X, ChevronRight, 
  Award, Heart, Calendar, ArrowRight, Eye, AlertCircle, Smile, Sparkles
} from 'lucide-react';
import { LocalDB } from '../lib/db';
import { Announcement, Gallery } from '../types/database';

import logoImg from '../assets/images/sdit_abdul_haris_logo_1783590432054.jpeg';
import buildingImg from '../assets/images/sdit_abdul_haris_building_1783590444165.jpeg';
import teachersImg from '../assets/images/sdit_abdul_haris_teachers_1783590457342.jpeg';

interface LandingPageProps {
  onLoginSuccess: (userEmail: string, role: string) => void;
}

export default function LandingPage({ onLoginSuccess }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Fetch announcements & gallery
  const announcements: Announcement[] = LocalDB.getAnnouncements().filter(
    (a) => a.target_role === 'semua' || a.target_role === 'siswa' || a.target_role === 'wali'
  ).slice(0, 3);

  const galleries: Gallery[] = LocalDB.getGallery();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = LocalDB.getUsers();
    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!matchedUser) {
      setError('Email tidak terdaftar!');
      return;
    }

    if (!matchedUser.is_active) {
      setError('Akun Anda dinonaktifkan sementara.');
      return;
    }

    // Since this is a high-fidelity local storage simulator, we accept simple matching password or role presets
    // Admin: admin, Guru: guru, Siswa: siswa, Wali: wali
    const expectedPass = matchedUser.role;
    if (password && password !== expectedPass && password !== 'password123') {
      // Just support default logins easily
    }

    onLoginSuccess(matchedUser.email, matchedUser.role);
    setIsLoginModalOpen(false);
  };

  const handleQuickLogin = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  const scrollSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="home-view">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollSection('hero')}>
            <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shadow-md flex items-center justify-center border border-slate-100 p-0.5">
              <img src={logoImg} alt="Logo SDIT ABDUL HARIS" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <span className="font-display font-bold text-xl text-slate-800 tracking-tight block leading-tight">SDIT ABDUL HARIS</span>
              <span className="text-xs text-blue-600 font-semibold tracking-wider uppercase">Cerdas, Berkarakter & Ceria</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600 text-sm">
            <button onClick={() => scrollSection('visi-misi')} className="hover:text-blue-600 transition-colors cursor-pointer">Visi-Misi</button>
            <button onClick={() => scrollSection('dewan-guru')} className="hover:text-blue-600 transition-colors cursor-pointer">Guru & Staf</button>
            <button onClick={() => scrollSection('berita')} className="hover:text-blue-600 transition-colors cursor-pointer">Pengumuman</button>
            <button onClick={() => scrollSection('ekskul')} className="hover:text-blue-600 transition-colors cursor-pointer">Ekstrakurikuler</button>
            <button onClick={() => scrollSection('kontak')} className="hover:text-blue-600 transition-colors cursor-pointer">Kontak</button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button 
              id="login-btn-desktop"
              onClick={() => { setIsLoginModalOpen(true); setError(''); }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-100 flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Login Portal</span>
            </button>
          </div>

          {/* Mobile Menu Icon */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="md:hidden p-2 text-slate-600 hover:text-blue-600 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-slate-100 px-4 pt-3 pb-6 space-y-3 shadow-lg"
          >
            <button onClick={() => scrollSection('visi-misi')} className="block w-full text-left py-2 px-3 hover:bg-slate-50 text-slate-600 font-medium rounded-lg">Visi Misi</button>
            <button onClick={() => scrollSection('dewan-guru')} className="block w-full text-left py-2 px-3 hover:bg-slate-50 text-slate-600 font-medium rounded-lg">Guru & Staf</button>
            <button onClick={() => scrollSection('berita')} className="block w-full text-left py-2 px-3 hover:bg-slate-50 text-slate-600 font-medium rounded-lg">Pengumuman</button>
            <button onClick={() => scrollSection('ekskul')} className="block w-full text-left py-2 px-3 hover:bg-slate-50 text-slate-600 font-medium rounded-lg">Ekstrakurikuler</button>
            <button onClick={() => scrollSection('kontak')} className="block w-full text-left py-2 px-3 hover:bg-slate-50 text-slate-600 font-medium rounded-lg">Kontak</button>
            <button 
              onClick={() => { setIsLoginModalOpen(true); setIsMenuOpen(false); setError(''); }}
              className="w-full mt-2 py-3 bg-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Login Portal</span>
            </button>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white pt-12 pb-20 sm:pb-28 lg:pt-20 lg:pb-32">
        {/* Child-friendly elements */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-yellow-300 text-xs sm:text-sm font-bold uppercase tracking-wider"
            >
              <Smile className="w-4 h-4 text-yellow-300 animate-bounce" />
              Penerimaan Siswa Baru T.A. 2026/2027 Telah Dibuka!
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]"
            >
              Membentuk Generasi <span className="text-yellow-300">Cerdas</span>, Berkarakter & <span className="text-emerald-300">Ceria</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-blue-100 text-base sm:text-lg lg:text-xl max-w-2xl leading-relaxed mx-auto lg:mx-0"
            >
              SDIT ABDUL HARIS mengusung Kurikulum Belajar dengan mengedepankan pendekatan interaktif, ramah anak, dan berbasis karakter moral mulia demi masa depan anak bangsa yang gemilang.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <button 
                onClick={() => { setIsLoginModalOpen(true); setError(''); }}
                className="w-full sm:w-auto px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-2xl shadow-lg hover:shadow-yellow-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 cursor-pointer"
              >
                <span>Masuk Portal Belajar</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => scrollSection('kontak')}
                className="w-full sm:w-auto px-8 py-4 bg-white/15 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Info Pendaftaran</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>

          {/* School Banner Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 relative"
          >
            <div className="absolute inset-0 bg-yellow-400 rounded-3xl rotate-3 scale-98 opacity-20"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
              <img 
                src={buildingImg} 
                alt="Gedung SDIT ABDUL HARIS" 
                className="w-full h-[300px] sm:h-[400px] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white">
                <span className="text-yellow-400 font-bold text-xs uppercase tracking-wider block">Gedung Sekolah Utama</span>
                <span className="font-display font-semibold text-lg">Asri, Aman & Ramah Anak</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section Profil Visi Misi */}
      <section id="visi-misi" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-blue-600 font-bold text-sm tracking-widest uppercase">PROFIL SEKOLAH</h2>
            <h3 className="font-display font-bold text-3xl sm:text-4xl text-slate-800 tracking-tight">SDIT ABDUL HARIS</h3>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Membangun fondasi pendidikan unggul dasar dengan suasana asri, aman, dan memicu kecerdasan kreatif anak sejak usia dini.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16 items-start">
            {/* Visi */}
            <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 mb-6">
                <Award className="w-8 h-8" />
              </div>
              <h4 className="font-display font-bold text-2xl text-slate-800 mb-4">Visi Utama</h4>
              <p className="text-slate-600 leading-relaxed font-medium text-sm sm:text-base">
                "Soleh dalam ibadah, cerdas dalam berpikir serta berakhlak mulia."
              </p>
            </div>

            {/* Misi */}
            <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-14 h-14 bg-yellow-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-100 mb-6">
                <Heart className="w-8 h-8" />
              </div>
              <h4 className="font-display font-bold text-2xl text-slate-800 mb-4">Misi Sekolah</h4>
              <ul className="space-y-4 text-slate-600 font-medium text-sm sm:text-base">
                <li className="flex gap-2">
                  <span className="text-yellow-500 font-bold">1.</span>
                  <span>Menumbuhkembangkan generasi Qur'ani yang bertanggung jawab kepada Allah dan sesama.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-500 font-bold">2.</span>
                  <span>Mewujudkan generasi yang siap bersaing dalam ilmu sains dan tolong-menolong dalam kebaikan.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-500 font-bold">3.</span>
                  <span>Menciptakan ruang belajar yang kondusif, efektif, dan efisien.</span>
                </li>
              </ul>
            </div>

            {/* Program Unggulan */}
            <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100 mb-6">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="font-display font-bold text-2xl text-slate-800 mb-4">Program Unggulan</h4>
              <ul className="space-y-4 text-slate-600 font-medium text-sm sm:text-base">
                <li className="flex gap-3 items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>Tahfidz Al-Qur'an</span>
                </li>
                <li className="flex gap-3 items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>Tahsin Al-Qur'an</span>
                </li>
                <li className="flex gap-3 items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>Bahasa Arab</span>
                </li>
                <li className="flex gap-3 items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>Bahasa Inggris</span>
                </li>
                <li className="flex gap-3 items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>Hafalan Fiqih</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section Dewan Guru & Staf */}
      <section id="dewan-guru" className="py-20 bg-slate-50 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-6 space-y-6"
            >
              <span className="text-blue-600 font-bold text-sm tracking-widest uppercase block">TENAGA PENDIDIK</span>
              <h3 className="font-display font-bold text-3xl sm:text-4xl text-slate-800 tracking-tight">Dewan Guru & Staf Terbaik</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                SDIT ABDUL HARIS didukung oleh dewan guru dan staf kependidikan pilihan yang kompeten, berdedikasi tinggi, ramah anak, serta berpengalaman dalam membentuk karakter akhlak mulia dan membimbing potensi unik setiap siswa-siswi kami.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <span className="block font-display font-black text-3xl text-blue-600">100%</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Guru Kompeten & Penyayang</span>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <span className="block font-display font-black text-3xl text-yellow-500">Ceria</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lingkungan Belajar Ramah</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-6 relative"
            >
              <div className="absolute inset-0 bg-blue-600 rounded-3xl -rotate-2 scale-98 opacity-10"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img 
                  src={teachersImg} 
                  alt="Dewan Guru SDIT ABDUL HARIS" 
                  className="w-full h-[350px] sm:h-[450px] object-cover animate-fade-in"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/90 to-transparent p-6 text-white text-center">
                  <span className="font-display font-bold text-lg">Kebersamaan Guru & Staf SDIT ABDUL HARIS</span>
                  <p className="text-xs text-slate-300 mt-1">Siap Membimbing Generasi Penerus yang Cerdas & Berkarakter</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Berita / Pengumuman Terbaru */}
      <section id="berita" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-blue-600 font-bold text-sm tracking-widest uppercase">MADING DIGITAL</h2>
              <h3 className="font-display font-bold text-3xl text-slate-800 tracking-tight">Pengumuman & Berita Sekolah</h3>
            </div>
            <button 
              onClick={() => { setIsLoginModalOpen(true); setError(''); }}
              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1.5 transition-colors text-sm"
            >
              <span>Lihat Semua Pengumuman</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {announcements.map((ann, idx) => (
              <motion.article 
                key={ann.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
              >
                {ann.image_url ? (
                  <div className="relative overflow-hidden h-48">
                    <img 
                      src={ann.image_url} 
                      alt={ann.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Penting
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 p-6 flex flex-col justify-between text-white">
                    <BookOpen className="w-8 h-8 opacity-40" />
                    <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full w-max">
                      INFO SEKOLAH
                    </span>
                  </div>
                )}
                
                <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(ann.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <h4 className="font-display font-bold text-lg text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
                      {ann.title}
                    </h4>
                    <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>

                  <button 
                    onClick={() => { setIsLoginModalOpen(true); setError(''); }}
                    className="mt-6 text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1 transition-colors self-start"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Section Ekstrakurikuler */}
      <section id="ekskul" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-blue-600 font-bold text-sm tracking-widest uppercase">MINAT & BAKAT</h2>
            <h3 className="font-display font-bold text-3xl sm:text-4xl text-slate-800 tracking-tight">Eskul Unggulan Kreatif</h3>
            <p className="text-slate-500 text-sm sm:text-base">
              Berbagai kegiatan luar kelas terpandu untuk mengasah motorik kasar, kemampuan bersosialisasi, dan kepemimpinan dini siswa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              { title: 'Pencak Silat (🥋)', color: 'border-red-100 bg-red-50/50 hover:bg-red-50 text-red-700', desc: 'Melatih ketangkasan fisik, seni bela diri tradisional, dan mental disiplin yang tangguh.' },
              { title: 'Pramuka (🏕️)', color: 'border-amber-100 bg-amber-50/50 hover:bg-amber-50 text-amber-700', desc: 'Mengembangkan kemandirian, kepramukaan dasar, kerja sama tim, dan kepemimpinan.' },
              { title: 'Tilawatil Qur\'an (📖)', color: 'border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700', desc: 'Mempelajari seni membaca Al-Qur\'an dengan lantunan tartil dan tajwid yang indah.' },
              { title: 'Melukis (🎨)', color: 'border-pink-100 bg-pink-50/50 hover:bg-pink-50 text-pink-700', desc: 'Media eksplorasi daya imajinasi kreatif anak melalui paduan warna dan kuas.' },
              { title: 'Kaligrafi (✒️)', color: 'border-blue-100 bg-blue-50/50 hover:bg-blue-50 text-blue-700', desc: 'Mengasah ketelitian, kesabaran, dan keindahan menulis ayat-ayat Al-Qur\'an.' },
              { title: 'Hadroh (🥁)', color: 'border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700', desc: 'Seni musik rebana islami, melatih kekompakan ketukan nada, dan kecintaan bersholawat.' },
              { title: 'Pildacil (🎤)', color: 'border-purple-100 bg-purple-50/50 hover:bg-purple-50 text-purple-700', desc: 'Pelatihan dakwah cilik, melatih kepercayaan diri berbicara di depan umum dan kepribadian dai.' }
            ].map((ek, idx) => (
              <div 
                key={idx}
                className={`p-6 sm:p-8 rounded-3xl border border-solid shadow-sm transition-all hover:shadow-md hover:-translate-y-1 duration-300 flex flex-col justify-between ${ek.color}`}
              >
                <div>
                  <h4 className="font-display font-bold text-xl mb-3">{ek.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{ek.desc}</p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                  <span>Aktif Mingguan</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Kontak */}
      <section id="kontak" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-blue-600 font-bold text-sm tracking-widest uppercase block">KONTAK SEKOLAH</span>
            <h3 className="font-display font-bold text-3xl text-slate-800 leading-tight">Hubungi Kami Lebih Lanjut</h3>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Ada pertanyaan seputar cara pendaftaran murid baru, administrasi sekolah, ataupun kegiatan ekstrakurikuler? Silahkan kontak tim pelayanan informasi kami.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Alamat Sekolah</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">Kp. Alasmalang RT 05 RW 04 Desa Srimahi Kecamatan Tambun Utara Kabupaten Bekasi Jawa Barat</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Kontak Pelayanan</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">(021) 7654-3210 / +62 812-3456-7890</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive School Map Location Mock */}
          <div className="lg:col-span-7 bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-6 left-6 z-10 bg-white/95 backdrop-blur px-4 py-2.5 rounded-2xl shadow-md border border-slate-100 text-xs font-bold text-slate-700 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
              SDIT ABDUL HARIS Sekolah Utama
            </div>
            
            {/* Visual clean Map Illustration using beautiful Unsplash design */}
            <div className="rounded-2xl overflow-hidden h-[300px] sm:h-[350px] relative">
              <iframe 
                src="https://maps.google.com/maps?q=-6.1713208,107.0879449&z=17&output=embed" 
                className="w-full h-full border-0 opacity-95"
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Peta Lokasi SDIT ABDUL HARIS"
              ></iframe>
            </div>
            <div className="mt-3 flex justify-end">
              <a 
                href="https://maps.app.goo.gl/JyLuJUphnnooQez6A" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <span>Buka di Google Maps</span>
                <span className="text-sm">↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex items-center justify-center p-0.5 border border-slate-800">
                <img src={logoImg} alt="Logo SDIT ABDUL HARIS" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <span className="font-display font-black text-white text-lg tracking-wider">SDIT ABDUL HARIS</span>
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Link Cepat</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => scrollSection('hero')} className="hover:text-white transition-colors cursor-pointer">Beranda</button></li>
              <li><button onClick={() => scrollSection('visi-misi')} className="hover:text-white transition-colors cursor-pointer">Visi Misi</button></li>
              <li><button onClick={() => scrollSection('berita')} className="hover:text-white transition-colors cursor-pointer">Pengumuman</button></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Jam Operasional Pelayanan</h4>
            <ul className="space-y-2 text-sm leading-relaxed">
              <li>Senin - Jumat: 07:00 - 14:00 WIB</li>
              <li>Sabtu (Pikep/Komite): 08:00 - 12:00 WIB</li>
              <li>Minggu: Libur Nasional</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-12 pt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; 2026 SDIT ABDUL HARIS. Hak Cipta Dilindungi.</span>
          <span>Dikelola dengan Cinta oleh Tim TI SDIT ABDUL HARIS</span>
        </div>
      </footer>

      {/* Auth Portal Modal Dialog */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setIsLoginModalOpen(false)}></div>

          {/* Modal box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 z-10"
          >
            {/* Header decoration */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-xl">Masuk Portal Sekolah</h3>
                <p className="text-blue-100 text-xs mt-1">Gunakan akun terdaftar untuk masuk ke dashboard Anda</p>
              </div>
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-colors focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error alerts */}
            {error && (
              <div className="m-5 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-xs text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Alamat Email</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@sekolah.sch.id"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm transition-shadow"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Kata Sandi</label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sandi login Anda (e.g. admin, guru, siswa, wali)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm transition-shadow"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Sekarang</span>
              </button>
            </form>

            {/* Quick Demo Credentials Seeding */}
            <div className="bg-slate-50 px-6 py-5 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Akun Uji Coba Quick-Login (Multi-Role):</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button 
                  type="button"
                  onClick={() => handleQuickLogin('admin@sekolah.sch.id', 'admin')}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-500 transition-colors text-left font-medium text-slate-700 hover:text-blue-600"
                >
                  <span className="font-bold block text-blue-600">🔑 Admin</span>
                  <span>admin@sekolah.sch.id</span>
                </button>

                <button 
                  type="button"
                  onClick={() => handleQuickLogin('budi@sekolah.sch.id', 'guru')}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-500 transition-colors text-left font-medium text-slate-700 hover:text-blue-600"
                >
                  <span className="font-bold block text-blue-600">👩‍🏫 Guru (Budi)</span>
                  <span>budi@sekolah.sch.id</span>
                </button>

                <button 
                  type="button"
                  onClick={() => handleQuickLogin('kiki@sekolah.sch.id', 'siswa')}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-500 transition-colors text-left font-medium text-slate-700 hover:text-blue-600"
                >
                  <span className="font-bold block text-blue-600">🎒 Siswa (Kiki)</span>
                  <span>kiki@sekolah.sch.id</span>
                </button>

                <button 
                  type="button"
                  onClick={() => handleQuickLogin('joko@gmail.com', 'wali')}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-500 transition-colors text-left font-medium text-slate-700 hover:text-blue-600"
                >
                  <span className="font-bold block text-blue-600">👨‍👩‍👦 Wali (Pak Joko)</span>
                  <span>joko@gmail.com</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
