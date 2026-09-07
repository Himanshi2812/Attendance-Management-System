import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, Sparkles, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [activeRoleTab, setActiveRoleTab] = useState('EMPLOYEE'); // 'EMPLOYEE' vs 'HR_ADMIN'
  const [email, setEmail] = useState('john@company.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const isDark = theme === 'dark';

  const handleTabSwitch = (role) => {
    setActiveRoleTab(role);
    setError('');
    if (role === 'HR_ADMIN') {
      setEmail('admin@company.com');
      setPassword('password123');
    } else {
      setEmail('john@company.com');
      setPassword('password123');
    }
  };

  const fillCredential = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    if (demoEmail === 'admin@company.com') {
      setActiveRoleTab('HR_ADMIN');
    } else {
      setActiveRoleTab('EMPLOYEE');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-[calc(100vh-73px)] flex items-center justify-center p-6 relative transition-colors duration-200 ${
      isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="w-full max-w-md space-y-5">
        <div className="text-center space-y-2">
          <div className={`inline-flex p-3 rounded-xl border ${
            isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
          }`}>
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Enterprise HR Management</h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sign in to manage employee attendance, shifts, and leaves</p>
        </div>

        {/* Login Form Card with Role Tabs */}
        <div className={`border rounded-2xl shadow-xl overflow-hidden space-y-4 transition-colors duration-200 ${
          isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'
        }`}>
          {/* Role Tabs */}
          <div className={`grid grid-cols-2 border-b p-1 ${
            isDark ? 'bg-[#090d16] border-[#1f293d]' : 'bg-slate-100/80 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => handleTabSwitch('EMPLOYEE')}
              className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 ${
                activeRoleTab === 'EMPLOYEE'
                  ? isDark
                    ? 'bg-[#1e293b] text-indigo-400 shadow-xs border border-indigo-500/30'
                    : 'bg-white text-indigo-600 shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              <span>Employee Login</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('HR_ADMIN')}
              className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 ${
                activeRoleTab === 'HR_ADMIN'
                  ? isDark
                    ? 'bg-[#1e293b] text-purple-400 shadow-xs border border-purple-500/30'
                    : 'bg-white text-purple-700 shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <span>HR Admin Login</span>
            </button>
          </div>

          <div className="p-6 pt-2 space-y-4">
            {error && (
              <div className={`p-3 rounded-lg border text-xs font-medium ${
                isDark ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {activeRoleTab === 'HR_ADMIN' ? 'HR Admin Email' : 'Employee Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeRoleTab === 'HR_ADMIN' ? 'admin@company.com' : 'john@company.com'}
                    className={`w-full border rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none transition ${
                      isDark
                        ? 'bg-[#090d16] border-[#1f293d] text-slate-100 placeholder-slate-500 focus:border-indigo-500'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-600'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full border rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none transition ${
                      isDark
                        ? 'bg-[#090d16] border-[#1f293d] text-slate-100 placeholder-slate-500 focus:border-indigo-500'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-600'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center justify-center space-x-2 ${
                  activeRoleTab === 'HR_ADMIN' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to {activeRoleTab === 'HR_ADMIN' ? 'HR Portal' : 'Employee Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className={`text-center text-xs pt-2 border-t ${isDark ? 'text-slate-400 border-[#1f293d]' : 'text-slate-500 border-slate-100'}`}>
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-500 font-semibold hover:underline">
                Create Employee Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Credentials Reference Box */}
        <div className={`border p-4 rounded-2xl space-y-2.5 shadow-xs transition-colors duration-200 ${
          isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'
        }`}>
          <div className={`flex items-center space-x-1.5 text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Sample Test Credentials (Reference)</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className={`flex items-center justify-between p-2.5 border rounded-xl ${
              isDark ? 'bg-[#090d16] border-[#1f293d]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <div className={`font-bold ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>Himanshi Kalra (HR Director)</div>
                <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email: admin@company.com | Pass: password123</div>
              </div>
              <button
                type="button"
                onClick={() => fillCredential('admin@company.com', 'password123')}
                className={`text-[11px] font-semibold px-2 py-1 border rounded-lg shadow-2xs transition ${
                  isDark
                    ? 'bg-[#131b2e] border-indigo-500/30 text-indigo-400 hover:bg-[#1a243b]'
                    : 'bg-white border-indigo-200 text-indigo-600 hover:bg-slate-50'
                }`}
              >
                Use Info
              </button>
            </div>

            <div className={`flex items-center justify-between p-2.5 border rounded-xl ${
              isDark ? 'bg-[#090d16] border-[#1f293d]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <div className={`font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>Sakshi Kumari (Cloud Architect)</div>
                <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email: john@company.com | Pass: password123</div>
              </div>
              <button
                type="button"
                onClick={() => fillCredential('john@company.com', 'password123')}
                className={`text-[11px] font-semibold px-2 py-1 border rounded-lg shadow-2xs transition ${
                  isDark
                    ? 'bg-[#131b2e] border-indigo-500/30 text-indigo-400 hover:bg-[#1a243b]'
                    : 'bg-white border-indigo-200 text-indigo-600 hover:bg-slate-50'
                }`}
              >
                Use Info
              </button>
            </div>

            <div className={`flex items-center justify-between p-2.5 border rounded-xl ${
              isDark ? 'bg-[#090d16] border-[#1f293d]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <div className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Ishita Mukherjee (UX Lead)</div>
                <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email: emily@company.com | Pass: password123</div>
              </div>
              <button
                type="button"
                onClick={() => fillCredential('emily@company.com', 'password123')}
                className={`text-[11px] font-semibold px-2 py-1 border rounded-lg shadow-2xs transition ${
                  isDark
                    ? 'bg-[#131b2e] border-indigo-500/30 text-indigo-400 hover:bg-[#1a243b]'
                    : 'bg-white border-indigo-200 text-indigo-600 hover:bg-slate-50'
                }`}
              >
                Use Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
