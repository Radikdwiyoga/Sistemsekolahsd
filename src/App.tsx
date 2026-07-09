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

  // Check persistent session on mount
  useEffect(() => {
    // This also triggers LocalDB initial seed on load
    const users = LocalDB.getUsers();
    
    const storedUserEmail = localStorage.getItem('sd_merdeka_session_user_email');
    if (storedUserEmail) {
      const foundUser = users.find(u => u.email.toLowerCase() === storedUserEmail.toLowerCase() && u.is_active);
      if (foundUser) {
        setCurrentUser(foundUser);
      } else {
        localStorage.removeItem('sd_merdeka_session_user_email');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userEmail: string) => {
    const users = LocalDB.getUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
    if (foundUser && foundUser.is_active) {
      setCurrentUser(foundUser);
      localStorage.setItem('sd_merdeka_session_user_email', foundUser.email);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sd_merdeka_session_user_email');
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

