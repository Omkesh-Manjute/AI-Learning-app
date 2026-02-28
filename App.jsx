import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import { DataProvider } from './DataContext.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import TeacherDashboard from './TeacherDashboard.jsx';
import StudentDashboard from './StudentDashboard.jsx';
import { Loading } from './Loading.jsx';

function AppContent() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <Loading text="Starting SimpleLearn..." />
    </div>
  );

  if (!user) {
    return showRegister
      ? <Register onSwitchToLogin={() => setShowRegister(false)} />
      : <Login onSwitchToRegister={() => setShowRegister(true)} />;
  }

  return user.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

