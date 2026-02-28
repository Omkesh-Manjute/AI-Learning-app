import { useState, useEffect } from 'react';
import { useData } from './DataContext.jsx';
import { useAuth } from './AuthContext.jsx';
import { generateTestWithAI, generateFallbackTest, getAutoProvider, PROVIDERS } from './aiService.js';
import { Sparkles, BookOpen, CheckCircle, Edit2, Save, Trash2, Plus, Key, AlertCircle, Eye, ExternalLink, ChevronDown } from 'lucide-react';

const TYPE_LABELS  = { mcq: 'MCQ', true_false: 'True/False', short_answer: 'Short Answer' };
const TYPE_COLORS  = { mcq: 'bg-blue-100 text-blue-700', true_false: 'bg-green-100 text-green-700', short_answer: 'bg-purple-100 text-purple-700' };

// ── Question editor ───────────────────────────────────────────────────
function QuestionEditor({ q, index, onChange, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(q);
  const save = () => { onChange(local); setEditing(false); };

  return (
    <div className="card border border-blue-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">{index + 1}</span>
          <div className="flex-1">
            <span className={`badge ${TYPE_COLORS[q.type]} mb-2`}>{TYPE_LABELS[q.type]}</span>
            {editing ? (
              <div className="space-y-3 mt-2">
                <textarea value={local.question} onChange={e => setLocal({...local, question: e.target.value})}
                  className="input-field h-20 resize-none text-sm" />
                {local.type === 'mcq' && (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-500">Options</p>
                    {local.options?.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={opt} onChange={e => { const o=[...local.options]; o[i]=e.target.value; setLocal({...local,options:o}); }}
                          className="input-field flex-1 text-sm" />
                        <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                          <input type="radio" checked={local.correctAnswer===opt} onChange={() => setLocal({...local,correctAnswer:opt})} /> Correct
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                {local.type === 'true_false' && (
                  <div className="flex gap-3">
                    {['true','false'].map(v => (
                      <label key={v} className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer font-bold text-sm border-2 transition-all ${local.correctAnswer===v?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200'}`}>
                        <input type="radio" value={v} checked={local.correctAnswer===v} onChange={() => setLocal({...local,correctAnswer:v})} className="hidden" />
                        {v==='true'?'✓ True':'✗ False'}
                      </label>
                    ))}
                  </div>
                )}
                {local.type === 'short_answer' && (
                  <input value={local.correctAnswer} onChange={e => setLocal({...local,correctAnswer:e.target.value})} className="input-field text-sm" placeholder="Expected answer" />
                )}
                <input value={local.explanation||''} onChange={e => setLocal({...local,explanation:e.target.value})} className="input-field text-sm" placeholder="Explanation..." />
                <div className="flex gap-2">
                  <button onClick={save} className="btn-primary text-sm py-1.5 px-4 flex items-center gap-1"><Save size={14}/> Save</button>
                  <button onClick={()=>setEditing(false)} className="btn-secondary text-sm py-1.5 px-4">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-gray-700">{q.question}</p>
                {q.type==='mcq' && (
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {q.options?.map((opt,i)=>(
                      <span key={i} className={`text-xs px-2 py-1 rounded-lg ${opt===q.correctAnswer?'bg-green-100 text-green-700 font-bold':'bg-gray-50 text-gray-600'}`}>
                        {opt===q.correctAnswer?'✓ ':''}{opt}
                      </span>
                    ))}
                  </div>
                )}
                {q.type==='true_false' && <p className="text-xs mt-1 text-green-700 font-bold">Answer: {q.correctAnswer==='true'?'✓ True':'✗ False'}</p>}
                {q.type==='short_answer' && <p className="text-xs mt-1 text-green-700 font-bold">Answer: {q.correctAnswer}</p>}
                {q.explanation && <p className="text-xs text-gray-400 mt-1 italic">💡 {q.explanation}</p>}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={()=>setEditing(!editing)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-400"><Edit2 size={14}/></button>
          <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={14}/></button>
        </div>
      </div>
    </div>
  );
}

// ── Provider Selector ─────────────────────────────────────────────────
function ProviderSelector({ provider, apiKey, onProviderChange, onApiKeyChange, onSaveKey }) {
  const [open, setOpen] = useState(false);
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const autoProvider = getAutoProvider();

  return (
    <div className="card border border-yellow-200 bg-yellow-50 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-yellow-800 flex items-center gap-2"><Key size={14}/> AI Provider Settings</p>
        {autoProvider && (
          <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">
            ✓ Auto-detected from .env
          </span>
        )}
      </div>

      {/* Provider buttons */}
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(PROVIDERS).map(([key, p]) => (
          <button key={key} onClick={() => onProviderChange(key)}
            className={`p-2.5 rounded-xl border-2 text-left transition-all ${provider===key?'border-blue-500 bg-blue-50':'border-gray-200 bg-white hover:border-blue-300'}`}>
            <p className="text-xs font-bold text-gray-700">{p.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{p.badge}</p>
          </button>
        ))}
      </div>

      {/* API key input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-yellow-800">
            {PROVIDERS[provider]?.name} API Key
          </label>
          <a href={PROVIDERS[provider]?.docsUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            Get free key <ExternalLink size={10}/>
          </a>
        </div>
        <div className="flex gap-2">
          <input
            type="password"
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            className="input-field flex-1 text-sm"
            placeholder={`Enter your ${PROVIDERS[provider]?.name} key...`}
          />
          <button onClick={() => { onApiKeyChange(keyInput); onSaveKey(provider, keyInput); }}
            className="btn-primary px-4 text-sm">Save</button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-3 text-xs text-gray-500 space-y-1">
        <p className="font-bold text-gray-600">📌 Vercel deploy ke liye:</p>
        <p>Environment variables mein set karo:</p>
        <div className="font-mono bg-gray-50 rounded-lg p-2 space-y-1 text-xs">
          <p className="text-green-700">VITE_GROQ_API_KEY = gsk_...</p>
          <p className="text-blue-700">VITE_GEMINI_API_KEY = AIza...</p>
          <p className="text-purple-700">VITE_OPENAI_API_KEY = sk-...</p>
        </div>
        <p className="text-yellow-600 font-semibold">App automatically pick karega jo available ho!</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────
export default function AITestGenerator() {
  const { getChapters, getTests, createTest, showToast } = useData();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [questionTypes, setQuestionTypes] = useState(['mcq', 'true_false', 'short_answer']);
  const [testTitle, setTestTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState(15);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedTests, setSavedTests] = useState([]);
  const [showProviderSettings, setShowProviderSettings] = useState(false);

  // AI provider state
  const auto = getAutoProvider();
  const [provider, setProvider] = useState(
    auto?.provider || localStorage.getItem('sl_ai_provider') || 'groq'
  );
  const [apiKey, setApiKey] = useState(
    auto?.apiKey || localStorage.getItem(`sl_ai_key_${provider}`) || ''
  );

  useEffect(() => {
    const load = async () => {
      setChapters(await getChapters());
      setSavedTests(await getTests());
    };
    load();
    // Update key when provider changes
    if (!auto) setApiKey(localStorage.getItem(`sl_ai_key_${provider}`) || '');
  }, [provider]);

  const saveProviderKey = (prov, key) => {
    localStorage.setItem('sl_ai_provider', prov);
    localStorage.setItem(`sl_ai_key_${prov}`, key);
    showToast(`${PROVIDERS[prov]?.name} key saved!`);
    setShowProviderSettings(false);
  };

  const toggleType = (t) => setQuestionTypes(prev =>
    prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
  );

  const handleGenerate = async () => {
    if (!selectedChapter) { setError('Please select a chapter'); return; }
    if (questionTypes.length === 0) { setError('Select at least one question type'); return; }
    setError('');
    setLoading(true);
    const chapter = chapters.find(c => c.id === selectedChapter);
    setTestTitle(`${chapter.title} - Test`);

    try {
      const qs = await generateTestWithAI({ apiKey, provider, chapter, questionCount, questionTypes });
      setQuestions(qs);
      setStep(2);
    } catch (err) {
      setError(`${err.message} — Using sample questions instead.`);
      const fallback = generateFallbackTest({ chapter, questionCount, questionTypes });
      setQuestions(fallback);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!testTitle) { setError('Please enter a test title'); return; }
    const chapter = chapters.find(c => c.id === selectedChapter);
    await createTest({
      chapter_id: selectedChapter,
      title: testTitle,
      questions,
      total_marks: questions.length,
      time_limit: timeLimit,
      class: chapter.class,
      subject: chapter.subject,
      created_by: user.id,
    });
    setSavedTests(await getTests());
    setStep(3);
  };

  const reset = () => { setStep(1); setQuestions([]); setSelectedChapter(''); setTestTitle(''); setError(''); };

  // ── Step 3: success ───────────────────────────────────────────────
  if (step === 3) return (
    <div className="animate-fadeIn flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Baloo 2', cursive" }}>Test Saved! 🎉</h2>
      <p className="text-gray-500">Test is now available for students.</p>
      <button onClick={reset} className="btn-primary flex items-center gap-2"><Plus size={16}/> Create Another</button>
    </div>
  );

  return (
    <div className="animate-fadeIn space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Baloo 2', cursive" }}>AI Test Generator ✨</h2>
          <p className="text-sm text-gray-500">Generate smart tests using AI from chapter content</p>
        </div>
        <button onClick={() => setShowProviderSettings(s => !s)}
          className={`flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-xl transition-all ${
            apiKey ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
          }`}>
          <Key size={14}/>
          {apiKey ? `${PROVIDERS[provider]?.name} ✓` : 'Set AI Key'}
        </button>
      </div>

      {/* Provider settings panel */}
      {showProviderSettings && (
        <ProviderSelector
          provider={provider}
          apiKey={apiKey}
          onProviderChange={setProvider}
          onApiKeyChange={setApiKey}
          onSaveKey={saveProviderKey}
        />
      )}

      {/* No key warning */}
      {!apiKey && !showProviderSettings && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-yellow-500 flex-shrink-0"/>
          <p className="text-sm text-yellow-700 font-semibold">
            No AI key set — sample questions will be generated.{' '}
            <button onClick={() => setShowProviderSettings(true)} className="underline text-blue-600">Set key</button>
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold">
          <AlertCircle size={16}/> {error}
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</div>
            <span className={`text-sm font-semibold ${step >= s ? 'text-blue-600' : 'text-gray-400'}`}>{s===1?'Configure':'Preview & Save'}</span>
            {s < 2 && <div className={`w-12 h-0.5 ${step > s ? 'bg-blue-400' : 'bg-gray-200'}`}/>}
          </div>
        ))}
      </div>

      {/* ── Step 1: Configure ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="card">
            <label className="block text-sm font-bold text-gray-600 mb-2">Select Chapter</label>
            <select value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)} className="input-field">
              <option value="">-- Choose a chapter --</option>
              {chapters.map(c => <option key={c.id} value={c.id}>Class {c.class} | {c.subject} | {c.title}</option>)}
            </select>
            {chapters.length === 0 && <p className="text-xs text-orange-500 mt-2 font-semibold">No chapters yet. Add chapters first!</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <label className="block text-sm font-bold text-gray-600 mb-3">Number of Questions</label>
              <div className="flex gap-2">
                {[5, 10, 15].map(n => (
                  <button key={n} onClick={() => setQuestionCount(n)}
                    className={`flex-1 py-2.5 rounded-xl font-bold border-2 transition-all ${questionCount===n?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200 text-gray-500 hover:border-blue-300'}`}>{n}</button>
                ))}
              </div>
            </div>
            <div className="card">
              <label className="block text-sm font-bold text-gray-600 mb-3">Time Limit (minutes)</label>
              <div className="flex gap-2">
                {[10, 15, 20, 30].map(n => (
                  <button key={n} onClick={() => setTimeLimit(n)}
                    className={`flex-1 py-2.5 rounded-xl font-bold border-2 text-sm transition-all ${timeLimit===n?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200 text-gray-500 hover:border-blue-300'}`}>{n}m</button>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <label className="block text-sm font-bold text-gray-600 mb-3">Question Types</label>
            <div className="flex gap-3 flex-wrap">
              {Object.entries(TYPE_LABELS).map(([type, label]) => (
                <button key={type} onClick={() => toggleType(type)}
                  className={`px-4 py-2.5 rounded-xl font-bold border-2 transition-all text-sm ${questionTypes.includes(type)?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200 text-gray-500 hover:border-blue-300'}`}>
                  {questionTypes.includes(type)?'✓ ':''}{label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading || !selectedChapter}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-50">
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> Generating with {PROVIDERS[provider]?.name}...</>
            ) : (
              <><Sparkles size={18}/> Generate {questionCount} Questions with AI</>
            )}
          </button>
        </div>
      )}

      {/* ── Step 2: Preview & Edit ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="card">
            <label className="block text-sm font-bold text-gray-600 mb-1.5">Test Title</label>
            <input value={testTitle} onChange={e => setTestTitle(e.target.value)} className="input-field" />
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-700">{questions.length} Questions Generated</h3>
            <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600 font-semibold">← Back</button>
          </div>

          <div className="space-y-3">
            {questions.map((q, i) => (
              <QuestionEditor key={q.id} q={q} index={i}
                onChange={updated => setQuestions(qs => qs.map(x => x.id===q.id ? updated : x))}
                onDelete={() => setQuestions(qs => qs.filter(x => x.id!==q.id))}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} className="btn-primary flex items-center gap-2 flex-1 justify-center py-3">
              <Save size={16}/> Save Test to Library
            </button>
            <button onClick={reset} className="btn-secondary">Start Over</button>
          </div>
        </div>
      )}

      {/* Saved tests list */}
      {savedTests.length > 0 && step === 1 && (
        <div className="card">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Eye size={16}/> Saved Tests ({savedTests.length})</h3>
          <div className="space-y-2">
            {savedTests.map(t => {
              const ch = chapters.find(c => c.id === t.chapter_id);
              return (
                <div key={t.id} className="flex items-center justify-between bg-blue-50 rounded-xl px-3 py-2">
                  <div>
                    <p className="text-sm font-bold text-gray-700">{t.title}</p>
                    <p className="text-xs text-gray-400">{ch ? `Class ${ch.class} | ${ch.subject}` : '—'} • {t.questions?.length} Q • {t.time_limit}min</p>
                  </div>
                  <span className="badge bg-green-100 text-green-700">{t.total_marks} marks</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

