import { useState, useEffect } from 'react';
import { useData } from './DataContext.jsx';
import { Users, TrendingUp, Award, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentProgress() {
  const { getStudents, getAllSubmissions, getTestById, getChapterById } = useData();
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setStudents(getStudents());
    setSubmissions(getAllSubmissions());
  }, []);

  const getStudentStats = (studentId) => {
    const subs = submissions.filter(s => s.studentId === studentId);
    if (subs.length === 0) return { taken: 0, avg: 0, best: 0 };
    const avg = subs.reduce((a, b) => a + b.percentage, 0) / subs.length;
    const best = Math.max(...subs.map(s => s.percentage));
    return { taken: subs.length, avg: Math.round(avg), best };
  };

  const getStudentTestHistory = (studentId) => {
    return submissions
      .filter(s => s.studentId === studentId)
      .map(s => {
        const test = getTestById(s.testId);
        return { ...s, testTitle: test?.title || 'Unknown', subject: test?.subject || '' };
      })
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  };

  const classWise = {};
  students.forEach(s => { classWise[s.class] = (classWise[s.class] || 0) + 1; });
  const chartData = Object.entries(classWise).sort((a,b) => Number(a[0])-Number(b[0])).map(([cls, count]) => ({ class: `Class ${cls}`, count }));

  const selectedStudentHistory = selected ? getStudentTestHistory(selected.id) : [];

  return (
    <div className="animate-fadeIn space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Baloo 2', cursive" }}>Student Progress</h2>
        <p className="text-sm text-gray-500">{students.length} students registered</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Students', value: students.length, icon: Users, color: 'text-blue-600 bg-blue-100' },
          { label: 'Total Submissions', value: submissions.length, icon: FileText, color: 'text-purple-600 bg-purple-100' },
          { label: 'Avg Score', value: submissions.length ? Math.round(submissions.reduce((a, b) => a + b.percentage, 0) / submissions.length) + '%' : 'N/A', icon: TrendingUp, color: 'text-green-600 bg-green-100' },
          { label: 'Top Score', value: submissions.length ? Math.max(...submissions.map(s => s.percentage)) + '%' : 'N/A', icon: Award, color: 'text-yellow-600 bg-yellow-100' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">{label}</p>
              <p className="text-xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-gray-700 mb-4">Students by Class</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="class" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Student list */}
        <div className="card">
          <h3 className="font-bold text-gray-700 mb-3">All Students</h3>
          {students.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No students registered yet.</p>
          ) : (
            <div className="space-y-2">
              {students.map(s => {
                const stats = getStudentStats(s.id);
                return (
                  <button key={s.id} onClick={() => setSelected(s)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selected?.id === s.id ? 'bg-blue-50 border-2 border-blue-300' : 'hover:bg-gray-50 border-2 border-transparent'}`}>
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                      {s.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-700 text-sm">{s.name}</p>
                      <p className="text-xs text-gray-400">Class {s.class} • {stats.taken} tests</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">{stats.avg}%</p>
                      <p className="text-xs text-gray-400">avg</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Student detail */}
        <div className="card">
          {selected ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {selected.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{selected.name}</h3>
                  <p className="text-sm text-gray-500">Class {selected.class}</p>
                </div>
              </div>

              {selectedStudentHistory.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No tests taken yet.</p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: 'Tests Taken', value: selectedStudentHistory.length },
                      { label: 'Avg Score', value: Math.round(selectedStudentHistory.reduce((a,b)=>a+b.percentage,0)/selectedStudentHistory.length) + '%' },
                      { label: 'Best Score', value: Math.max(...selectedStudentHistory.map(t=>t.percentage)) + '%' },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-blue-50 rounded-xl p-2 text-center">
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="font-bold text-blue-700">{value}</p>
                      </div>
                    ))}
                  </div>

                  <h4 className="font-bold text-gray-700 text-sm mb-2">Test History</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedStudentHistory.map(t => (
                      <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">{t.testTitle}</p>
                          <p className="text-xs text-gray-400">{new Date(t.completedAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`badge font-bold ${t.percentage >= 80 ? 'bg-green-100 text-green-700' : t.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {t.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <Users size={40} className="text-blue-200 mb-3" />
              <p className="text-gray-400 font-semibold">Select a student to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

