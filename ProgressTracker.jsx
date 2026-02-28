import { useState, useEffect } from 'react';
import { useData } from './DataContext.jsx';
import { useAuth } from './AuthContext.jsx';
import { TrendingUp, Award, Target, BookOpen, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar } from 'recharts';

export default function ProgressTracker() {
  const { user } = useAuth();
  const { getStudentTests, getTests, getChapters } = useData();
  const [submissions, setSubmissions] = useState([]);
  const [tests, setTests] = useState([]);
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    setSubmissions(getStudentTests(user.id));
    setTests(getTests());
    setChapters(getChapters());
  }, []);

  if (submissions.length === 0) {
    return (
      <div className="animate-fadeIn">
        <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: "'Baloo 2', cursive" }}>My Progress 📈</h2>
        <div className="card flex flex-col items-center justify-center py-16 text-center gap-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
            <TrendingUp size={32} className="text-blue-200" />
          </div>
          <h3 className="text-lg font-bold text-gray-700">No Progress Yet</h3>
          <p className="text-gray-400 text-sm max-w-xs">Take your first test to start tracking your progress!</p>
        </div>
      </div>
    );
  }

  const avg = Math.round(submissions.reduce((a, b) => a + b.percentage, 0) / submissions.length);
  const best = Math.max(...submissions.map(s => s.percentage));
  const recent = [...submissions].sort((a,b) => new Date(b.completedAt) - new Date(a.completedAt));

  // Timeline data (last 10 tests)
  const timelineData = [...submissions]
    .sort((a,b) => new Date(a.completedAt) - new Date(b.completedAt))
    .slice(-10)
    .map((s, i) => {
      const test = tests.find(t => t.id === s.testId);
      return { name: `T${i+1}`, score: s.percentage, test: test?.title || 'Test' };
    });

  // Subject-wise performance
  const subjectMap = {};
  submissions.forEach(s => {
    const test = tests.find(t => t.id === s.testId);
    if (!test) return;
    const subject = test.subject || 'Other';
    if (!subjectMap[subject]) subjectMap[subject] = { total: 0, count: 0 };
    subjectMap[subject].total += s.percentage;
    subjectMap[subject].count += 1;
  });
  const subjectData = Object.entries(subjectMap).map(([subject, d]) => ({
    subject, avg: Math.round(d.total / d.count)
  }));

  // Weak areas (below 60%)
  const weakAreas = subjectData.filter(s => s.avg < 60);

  // Chapter performance
  const chapterMap = {};
  submissions.forEach(s => {
    const test = tests.find(t => t.id === s.testId);
    if (!test) return;
    const ch = chapters.find(c => c.id === test.chapterId);
    if (!ch) return;
    if (!chapterMap[ch.id]) chapterMap[ch.id] = { title: ch.title, subject: ch.subject, total: 0, count: 0 };
    chapterMap[ch.id].total += s.percentage;
    chapterMap[ch.id].count += 1;
  });
  const chapterData = Object.values(chapterMap).map(c => ({ ...c, avg: Math.round(c.total / c.count) }));

  return (
    <div className="animate-fadeIn space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Baloo 2', cursive" }}>My Progress 📈</h2>
        <p className="text-sm text-gray-500">{submissions.length} tests taken</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Tests Taken', value: submissions.length, icon: BookOpen, color: 'bg-blue-500' },
          { label: 'Average Score', value: avg + '%', icon: TrendingUp, color: 'bg-green-500' },
          { label: 'Best Score', value: best + '%', icon: Award, color: 'bg-yellow-500' },
          { label: 'Pass Rate', value: Math.round((submissions.filter(s => s.percentage >= 50).length / submissions.length) * 100) + '%', icon: Target, color: 'bg-purple-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">{label}</p>
              <p className="text-xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Score timeline */}
      {timelineData.length > 1 && (
        <div className="card">
          <h3 className="font-bold text-gray-700 mb-4">Score Timeline</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(val) => [val + '%', 'Score']} />
              <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2.5} dot={{ fill: '#3B82F6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Subject performance */}
        {subjectData.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-gray-700 mb-4">Subject Performance</h3>
            <div className="space-y-3">
              {subjectData.sort((a,b) => b.avg - a.avg).map(s => (
                <div key={s.subject}>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span className="text-gray-600">{s.subject}</span>
                    <span className={s.avg >= 80 ? 'text-green-600' : s.avg >= 50 ? 'text-yellow-600' : 'text-red-500'}>{s.avg}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${s.avg >= 80 ? 'bg-green-500' : s.avg >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                      style={{ width: `${s.avg}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weak areas */}
        <div className="card">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-500" /> Areas to Improve
          </h3>
          {weakAreas.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2 text-center">
              <span className="text-4xl">🎉</span>
              <p className="font-bold text-green-600">Great performance!</p>
              <p className="text-sm text-gray-400">You're doing well in all subjects.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {weakAreas.map(s => (
                <div key={s.subject} className="flex items-center justify-between bg-red-50 rounded-xl px-3 py-2.5">
                  <div>
                    <p className="font-bold text-sm text-gray-700">{s.subject}</p>
                    <p className="text-xs text-gray-400">Needs more practice</p>
                  </div>
                  <span className="badge bg-red-100 text-red-600 font-bold">{s.avg}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent tests */}
      <div className="card">
        <h3 className="font-bold text-gray-700 mb-3">Recent Tests</h3>
        <div className="space-y-2">
          {recent.slice(0, 10).map(s => {
            const test = tests.find(t => t.id === s.testId);
            return (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-700">{test?.title || 'Test'}</p>
                  <p className="text-xs text-gray-400">{new Date(s.completedAt).toLocaleDateString()} • {s.score}/{test?.totalMarks || s.score} correct</p>
                </div>
                <div className="text-right">
                  <span className={`badge font-bold ${s.percentage >= 80 ? 'bg-green-100 text-green-700' : s.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {s.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

