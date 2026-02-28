import { useState } from 'react';
import Navbar from './Navbar.jsx';
import ChapterViewer from './ChapterViewer.jsx';
import TestTaker from './TestTaker.jsx';
import ProgressTracker from './ProgressTracker.jsx';
import { BookOpen, ClipboardList, TrendingUp, User } from 'lucide-react';
import { useData } from './DataContext.jsx';
import { useAuth } from './AuthContext.jsx';

const TABS = [
  { id: 'chapters', label: 'My Chapters', icon: BookOpen },
  { id: 'tests', label: 'My Tests', icon: ClipboardList },
  { id: 'progress', label: 'My Progress', icon: TrendingUp },
  { id: 'profile', label: 'Profile', icon: User },
];

function Profile() {
  const { user } = useAuth();
  const { getStudentTests, getTests } = useData();
  const submissions = getStudentTests(user.id);
  const tests = getTests();

  return (
    <div className="animate-fadeIn space-y-5">
      <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Baloo 2', cursive" }}>My Profile</h2>
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {user.name[0]}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
          <p className="text-gray-500">{user.email}</p>
          <div className="flex gap-2 mt-2">
            <span className="badge bg-blue-100 text-blue-700">Class {user.class}</span>
            <span className="badge bg-green-100 text-green-700 capitalize">{user.role}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'Tests Taken', value: submissions.length, color: 'text-blue-600 bg-blue-50' },
          { label: 'Avg Score', value: submissions.length ? Math.round(submissions.reduce((a,b)=>a+b.percentage,0)/submissions.length) + '%' : '—', color: 'text-green-600 bg-green-50' },
          { label: 'Best Score', value: submissions.length ? Math.max(...submissions.map(s=>s.percentage)) + '%' : '—', color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-2xl p-4 ${color}`}>
            <p className="text-sm font-semibold opacity-70">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-700 mb-3">Recent Activity</h3>
        {submissions.length === 0 ? (
          <p className="text-gray-400 text-sm">No activity yet. Take a test to get started!</p>
        ) : (
          <div className="space-y-2">
            {submissions.slice(-5).reverse().map(s => {
              const test = tests.find(t => t.id === s.testId);
              return (
                <div key={s.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{test?.title || 'Test'}</p>
                    <p className="text-xs text-gray-400">{new Date(s.completedAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`badge font-bold ${s.percentage >= 80 ? 'bg-green-100 text-green-700' : s.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {s.score}/{test?.totalMarks || s.score} ({s.percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('chapters');
  const { toast } = useData();

  const renderContent = () => {
    switch (activeTab) {
      case 'chapters': return <ChapterViewer />;
      case 'tests': return <TestTaker />;
      case 'progress': return <ProgressTracker />;
      case 'profile': return <Profile />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-60 bg-white min-h-[calc(100vh-57px)] border-r border-blue-50 p-4 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto hidden md:block">
          <nav className="space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`sidebar-link w-full text-left ${activeTab === id ? 'active' : ''}`}>
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
            <p className="text-sm font-bold mb-1">🌟 Keep Learning!</p>
            <p className="text-xs opacity-80">Consistency is the key to success. Study daily!</p>
          </div>
        </aside>

        {/* Mobile bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-blue-100 flex md:hidden z-30">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-bold transition-colors ${activeTab === id ? 'text-blue-600' : 'text-gray-400'}`}>
              <Icon size={20} />
              <span className="mt-0.5">{label.split(' ')[1] || label}</span>
            </button>
          ))}
        </div>

        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 max-w-5xl">
          {renderContent()}
        </main>
      </div>

      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'} flex items-center gap-2`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

