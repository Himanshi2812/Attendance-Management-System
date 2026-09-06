import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, Sparkles, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, 'password123');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-6 relative bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Enterprise HR Management</h2>
          <p className="text-xs text-slate-500">Sign in to manage employee attendance, shifts, and leaves</p>
        </div>

        {/* Turnkey Demo Credentials Panel */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 shadow-xs">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-700 mb-1">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Turnkey Demo Logins (One-Click Sign In)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('admin@company.com')}
              className="p-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition"
            >
              <div className="flex items-center space-x-1 text-xs font-semibold text-purple-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>David Chen</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">HR Director (Admin)</div>
            </button>

            <button
              onClick={() => handleQuickLogin('john@company.com')}
              className="p-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition"
            >
              <div className="flex items-center space-x-1 text-xs font-semibold text-indigo-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Alexander Wright</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Principal Architect</div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xl space-y-4">
          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded transition shadow-xs flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
              Create Employee Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
