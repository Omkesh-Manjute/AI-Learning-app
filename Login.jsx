import { useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { BookOpen, Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function Login({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'teacher') { setEmail('teacher@demo.com'); setPassword('demo123'); }
    else { setEmail('student@demo.com'); setPassword('demo123'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-blue-700" style={{ fontFamily: "'Baloo 2', cursive" }}>SimpleLearn</h1>
          <p className="text-blue-400 font-medium">Class 1 to 10 Learning Platform</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: "'Baloo 2', cursive" }}>Welcome Back! 👋</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="input-field pl-10" placeholder="your@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="input-field pl-10 pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 mb-3 text-center">DEMO ACCOUNTS</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => fillDemo('teacher')}
                className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold py-2 px-3 rounded-xl transition-all">
                🎓 Teacher Demo
              </button>
              <button onClick={() => fillDemo('student')}
                className="text-xs bg-green-50 hover:bg-green-100 text-green-700 font-bold py-2 px-3 rounded-xl transition-all">
                📚 Student Demo
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            New here?{' '}
            <button onClick={onSwitchToRegister} className="text-blue-600 font-bold hover:underline">
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

