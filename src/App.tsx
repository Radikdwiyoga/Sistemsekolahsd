import { useState, useEffect } from 'react';
import { LocalDB } from './lib/db';
import { User } from './types/database';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import ParentDashboard from './components/ParentDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for an existing server-side session on mount (cookie is sent automatically).
  useEffect(() => {
    let isMounted = true;

    // Still triggers LocalDB's initial seed/cache load for the rest of the app's data.
    LocalDB.getUsers();

    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (isMounted) setCurrentUser(data.user ?? null);
      })
      .catch(() => {
        if (isMounted) setCurrentUser(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Memuat Portal SDIT Abdul Haris...</p>
        </div>
      </div>
    );
  }

  // Router based on user role
  if (!currentUser) {
    return <LandingPage onLoginSuccess={handleLoginSuccess} />;
  }

  switch (currentUser.role) {
    case 'admin':
      return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
    case 'guru':
      return <TeacherDashboard currentUser={currentUser} onLogout={handleLogout} />;
    case 'siswa':
      return <StudentDashboard currentUser={currentUser} onLogout={handleLogout} />;
    case 'wali':
      return <ParentDashboard currentUser={currentUser} onLogout={handleLogout} />;
    default:
      return <LandingPage onLoginSuccess={handleLoginSuccess} />;
  }
}

