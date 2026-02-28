import { useState } from 'react';
import Navbar from './Navbar.jsx';
import ChapterManager from './ChapterManager.jsx';
import AITestGenerator from './AITestGenerator.jsx';
import StudentProgress from './StudentProgress.jsx';
import { LayoutDashboard, BookOpen, Sparkles, Users } from 'lucide-react';
import { useData } from './DataContext.jsx';
import { useAuth } from './AuthContext.jsx';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'chapters', label: 'Chapters', icon: BookOpen },
  { id: 'tests', label: 'AI Test Gen', icon: Sparkles },
  { id: 'students', label: 'Students', icon: Users },
];

function OverviewCard({ title, value, color, icon: Icon }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-semibold">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function Overview() {
  const { getChapters, getTests, getStudents, getAllSubmissions } = useData();
  const chapters = getChapters();
  const tests = getTests();
  const students = getStudents();
  const submissions = getAllSubmissions();

  const byClass = {};
  chapters.forEach(c => { byClass[c.class] = (byClass[c.class] || 0) + 1; });

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>Dashboard Overview</h2>
        <p className="text-gray-500 text-sm">Here's what's happening in your classes.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard title="Total Chapters" value={chapters.length} color="bg-blue-500" icon={BookOpen} />
        <OverviewCard title="Tests Created" value={tests.length} color="bg-purple-500" icon={Sparkles} />
        <OverviewCard title="Students" value={students.length} color="bg-green-500" icon={Users} />
        <OverviewCard title="Submissions" value={submissions.length} color="bg-orange-500" icon={LayoutDashboard} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-bold text-gray-700 mb-3">Chapters by Class</h3>
          <div className="space-y-2">
            {Object.keys(byClass).sort((a,b) => Number(a)-Number(b)).map(cls => (
              <div key={cls} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 w-16">Class {cls}</span>
                <div className="flex-1 bg-blue-50 rounded-full h-3 overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(byClass[cls] / chapters.length) * 100}%` }} />
                </div>
                <span className="text-sm font-bold text-blue-600">{byClass[cls]}</span>
              </div>
            ))}
            {chapters.length === 0 && <p className="text-gray-400 text-sm">No chapters yet.</p>}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-700 mb-3">Recent Students</h3>
          <div className="space-y-2">
            {students.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                  {s.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700">{s.name}</p>
                  <p className="text-xs text-gray-400">Class {s.class}</p>
                </div>
              </div>
            ))}
            {students.length === 0 && <p className="text-gray-400 text-sm">No students yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useData();

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview />;
      case 'chapters': return <ChapterManager />;
      case 'tests': return <AITestGenerator />;
      case 'students': return <StudentProgress />;
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

          <div className="mt-8 bg-blue-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-blue-600 mb-1">💡 Pro Tip</p>
            <p className="text-xs text-gray-500">Use AI Test Generator to create tests automatically from chapter content!</p>
          </div>
        </aside>

        {/* Mobile bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-blue-100 flex md:hidden z-30">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-bold transition-colors ${
                activeTab === id ? 'text-blue-600' : 'text-gray-400'
              }`}>
              <Icon size={20} />
              <span className="mt-0.5">{label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 max-w-5xl">
          {renderContent()}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${
          toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } flex items-center gap-2`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

