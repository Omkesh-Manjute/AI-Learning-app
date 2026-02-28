import { useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { BookOpen, User, Mail, Lock, GraduationCap } from 'lucide-react';

export default function Register({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', class: '6' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-blue-700" style={{ fontFamily: "'Baloo 2', cursive" }}>SimpleLearn</h1>
          <p className="text-blue-400 font-medium">Join thousands of learners!</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: "'Baloo 2', cursive" }}>Create Account ✨</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role toggle */}
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1.5">I am a...</label>
              <div className="grid grid-cols-2 gap-2">
                {['student', 'teacher'].map(r => (
                  <button key={r} type="button" onClick={() => set('role', r)}
                    className={`py-2.5 px-4 rounded-xl font-bold text-sm border-2 transition-all capitalize ${
                      form.role === r ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-blue-300'
                    }`}>
                    {r === 'student' ? '📚' : '🎓'} {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.name} onChange={e => set('name', e.target.value)} required
                  className="input-field pl-10" placeholder="Your full name" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required
                  className="input-field pl-10" placeholder="your@email.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required
                  className="input-field pl-10" placeholder="Min 6 characters" />
              </div>
            </div>

            {form.role === 'student' && (
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1.5">My Class</label>
                <div className="relative">
                  <GraduationCap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select value={form.class} onChange={e => set('class', e.target.value)}
                    className="input-field pl-10 appearance-none">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(c => (
                      <option key={c} value={String(c)}>Class {c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-blue-600 font-bold hover:underline">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

