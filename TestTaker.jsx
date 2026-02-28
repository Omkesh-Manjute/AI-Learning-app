import { useState, useEffect, useRef } from 'react';
import { useData } from './DataContext.jsx';
import { useAuth } from './AuthContext.jsx';
import { ClipboardList, Clock, Play, ChevronRight, ChevronLeft, CheckCircle, XCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { EmptyState } from './Loading.jsx';

function Timer({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);
  const interval = useRef(null);

  useEffect(() => {
    interval.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(interval.current); onExpire(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval.current);
  }, []);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = (remaining / seconds) * 100;
  const color = pct > 50 ? 'text-green-600' : pct > 25 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className={`flex items-center gap-2 font-bold ${color}`}>
      <Clock size={16} />
      <span>{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</span>
    </div>
  );
}

function TestInProgress({ test, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const q = test.questions[current];
  const total = test.questions.length;

  const handleSubmit = (forcedAnswers) => {
    const a = forcedAnswers || answers;
    let score = 0;
    test.questions.forEach(q => {
      const ans = (a[q.id] || '').toLowerCase().trim();
      const correct = (q.correctAnswer || '').toLowerCase().trim();
      if (q.type === 'short_answer') {
        if (ans === correct || ans.includes(correct) || correct.includes(ans)) score++;
      } else {
        if (ans === correct) score++;
      }
    });
    onComplete({ answers: a, score, percentage: Math.round((score / total) * 100) });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-800">{test.title}</h3>
          <p className="text-sm text-gray-500">Question {current + 1} of {total}</p>
        </div>
        <Timer seconds={test.timeLimit * 60} onExpire={() => handleSubmit(answers)} />
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl h-2 overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="card space-y-4">
        <div className="flex items-start gap-3">
          <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
            {current + 1}
          </span>
          <div className="flex-1">
            <span className={`badge mb-2 ${q.type === 'mcq' ? 'bg-blue-100 text-blue-700' : q.type === 'true_false' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
              {q.type === 'mcq' ? 'MCQ' : q.type === 'true_false' ? 'True/False' : 'Short Answer'}
            </span>
            <p className="font-semibold text-gray-800 text-base leading-relaxed">{q.question}</p>
          </div>
        </div>

        {/* MCQ */}
        {q.type === 'mcq' && (
          <div className="space-y-2 ml-11">
            {q.options?.map((opt, i) => (
              <button key={i} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                className={`w-full text-left p-3.5 rounded-xl font-semibold text-sm border-2 transition-all ${
                  answers[q.id] === opt ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                }`}>
                <span className="inline-flex w-6 h-6 rounded-full border-2 border-current items-center justify-center mr-2 text-xs">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* True/False */}
        {q.type === 'true_false' && (
          <div className="flex gap-4 ml-11">
            {['true', 'false'].map(v => (
              <button key={v} onClick={() => setAnswers(a => ({ ...a, [q.id]: v }))}
                className={`flex-1 py-4 rounded-xl font-bold text-base border-2 transition-all ${
                  answers[q.id] === v
                    ? v === 'true' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-400 bg-red-50 text-red-600'
                    : 'border-gray-200 hover:border-blue-300'
                }`}>
                {v === 'true' ? '✓ True' : '✗ False'}
              </button>
            ))}
          </div>
        )}

        {/* Short answer */}
        {q.type === 'short_answer' && (
          <div className="ml-11">
            <textarea value={answers[q.id] || ''} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
              className="input-field h-24 resize-none" placeholder="Type your answer here..." />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button onClick={() => setCurrent(c => c - 1)} disabled={current === 0} className="btn-secondary disabled:opacity-40 flex items-center gap-2">
          <ChevronLeft size={16} /> Prev
        </button>
        {current < total - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} className="btn-primary flex items-center gap-2 flex-1 justify-center">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={() => handleSubmit(answers)}
            className="btn-primary flex items-center gap-2 flex-1 justify-center bg-green-500 hover:bg-green-600">
            <CheckCircle size={16} /> Submit Test
          </button>
        )}
      </div>

      {/* Answered indicator */}
      <div className="card">
        <p className="text-xs font-bold text-gray-500 mb-2">Answer Progress</p>
        <div className="flex flex-wrap gap-1.5">
          {test.questions.map((q, i) => (
            <button key={q.id} onClick={() => setCurrent(i)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                i === current ? 'bg-blue-500 text-white ring-2 ring-blue-300' :
                answers[q.id] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">{Object.keys(answers).length}/{total} answered</p>
      </div>
    </div>
  );
}

function TestResult({ test, result, onRetake, onBack }) {
  const [showAnswers, setShowAnswers] = useState(false);

  const grade = result.percentage >= 90 ? { label: 'Excellent! 🌟', color: 'text-green-600', bg: 'bg-green-50' }
    : result.percentage >= 75 ? { label: 'Great Job! 👍', color: 'text-blue-600', bg: 'bg-blue-50' }
    : result.percentage >= 50 ? { label: 'Good Effort! 💪', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    : { label: 'Keep Trying! 📚', color: 'text-red-500', bg: 'bg-red-50' };

  return (
    <div className="animate-fadeIn space-y-4">
      <div className={`card ${grade.bg} border-0 text-center py-8`}>
        <div className={`text-5xl font-bold ${grade.color} mb-2`}>{result.percentage}%</div>
        <div className={`text-xl font-bold ${grade.color}`}>{grade.label}</div>
        <p className="text-gray-600 mt-2">{result.score}/{test.totalMarks} questions correct</p>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setShowAnswers(!showAnswers)} className="btn-secondary flex-1">
          {showAnswers ? 'Hide' : 'View'} Answers
        </button>
        <button onClick={onRetake} className="btn-primary flex-1 flex items-center gap-2 justify-center">
          <RotateCcw size={14} /> Retake
        </button>
      </div>
      <button onClick={onBack} className="btn-secondary w-full">← Back to Tests</button>

      {showAnswers && (
        <div className="space-y-3">
          {test.questions.map((q, i) => {
            const userAns = result.answers[q.id] || '';
            const isCorrect = userAns.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
              || (q.type === 'short_answer' && (userAns.toLowerCase().includes(q.correctAnswer.toLowerCase()) || q.correctAnswer.toLowerCase().includes(userAns.toLowerCase())));
            return (
              <div key={q.id} className={`card border-2 ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
                <div className="flex items-start gap-2 mb-2">
                  {isCorrect ? <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" /> : <XCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />}
                  <p className="text-sm font-semibold text-gray-700">{q.question}</p>
                </div>
                <div className="ml-6 space-y-1 text-xs">
                  <p><span className="font-bold text-gray-500">Your answer:</span> <span className={isCorrect ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{userAns || '(blank)'}</span></p>
                  {!isCorrect && <p><span className="font-bold text-gray-500">Correct:</span> <span className="text-green-600 font-bold">{q.correctAnswer}</span></p>}
                  {q.explanation && <p className="text-gray-400 italic">💡 {q.explanation}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TestTaker() {
  const { user } = useAuth();
  const { getTests, getChapters, submitTest, getStudentTests } = useData();

  const [view, setView] = useState('list'); // list | taking | result
  const [tests, setTests] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [result, setResult] = useState(null);
  const [filter, setFilter] = useState('all'); // all | attempted | pending

  const reload = () => {
    const allTests = getTests();
    const allChapters = getChapters();
    setTests(allTests.filter(t => !t.class || t.class === user.class));
    setChapters(allChapters);
    setMySubmissions(getStudentTests(user.id));
  };

  useEffect(() => { reload(); }, []);

  const startTest = (test) => { setActiveTest(test); setView('taking'); };

  const handleComplete = (res) => {
    submitTest({
      studentId: user.id,
      testId: activeTest.id,
      answers: res.answers,
      score: res.score,
      percentage: res.percentage,
      startedAt: new Date().toISOString(),
    });
    setResult(res);
    setView('result');
    reload();
  };

  const getChapter = (chId) => chapters.find(c => c.id === chId);
  const getLastAttempt = (testId) => mySubmissions.filter(s => s.testId === testId).sort((a,b) => new Date(b.completedAt)-new Date(a.completedAt))[0];

  if (view === 'taking' && activeTest) {
    return <TestInProgress test={activeTest} onComplete={handleComplete} />;
  }

  if (view === 'result' && result) {
    return <TestResult test={activeTest} result={result}
      onRetake={() => setView('taking')}
      onBack={() => { setView('list'); setActiveTest(null); setResult(null); }} />;
  }

  const filtered = tests.filter(t => {
    const attempted = mySubmissions.some(s => s.testId === t.id);
    if (filter === 'attempted') return attempted;
    if (filter === 'pending') return !attempted;
    return true;
  });

  return (
    <div className="animate-fadeIn space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Baloo 2', cursive" }}>My Tests 📝</h2>
        <p className="text-sm text-gray-500">{tests.length} tests available</p>
      </div>

      <div className="flex gap-2">
        {['all', 'pending', 'attempted'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all capitalize ${filter === f ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-blue-50'}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No tests available" desc="Your teacher hasn't created tests for your class yet." />
      ) : (
        <div className="space-y-3">
          {filtered.map(test => {
            const chapter = getChapter(test.chapterId);
            const lastAttempt = getLastAttempt(test.id);
            const attempted = !!lastAttempt;
            return (
              <div key={test.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{test.title}</h4>
                    {chapter && (
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="badge bg-blue-100 text-blue-700">Class {chapter.class}</span>
                        <span className="badge bg-purple-100 text-purple-700">{chapter.subject}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 font-semibold">
                      <span>📝 {test.questions?.length} Questions</span>
                      <span>⏱ {test.timeLimit} min</span>
                      <span>🏆 {test.totalMarks} marks</span>
                    </div>
                    {attempted && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`badge font-bold ${lastAttempt.percentage >= 80 ? 'bg-green-100 text-green-700' : lastAttempt.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          Last: {lastAttempt.percentage}%
                        </span>
                        <span className="text-xs text-gray-400">{new Date(lastAttempt.completedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => startTest(test)}
                      className={`flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-xl transition-all ${attempted ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                      {attempted ? <><RotateCcw size={14} /> Retake</> : <><Play size={14} /> Start</>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

