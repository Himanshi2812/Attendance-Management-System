import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, Sparkles, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [activeRoleTab, setActiveRoleTab] = useState('EMPLOYEE'); // 'EMPLOYEE' vs 'HR_ADMIN'
  const [email, setEmail] = useState('john@company.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-6 relative bg-slate-50">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Enterprise HR Management</h2>
          <p className="text-xs text-slate-500">Sign in to manage employee attendance, shifts, and leaves</p>
        </div>

        {/* Login Form Card with Role Tabs */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden space-y-4">
          {/* Role Tabs */}
          <div className="grid grid-cols-2 bg-slate-100/80 border-b border-slate-200 p-1">
            <button
              type="button"
              onClick={() => handleTabSwitch('EMPLOYEE')}
              className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 ${
                activeRoleTab === 'EMPLOYEE' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>Employee Login</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('HR_ADMIN')}
              className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 ${
                activeRoleTab === 'HR_ADMIN' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>HR Admin Login</span>
            </button>
          </div>

          <div className="p-6 pt-2 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 transition"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 transition"
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

            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
                Create Employee Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Credentials Reference Box (No One-Click Auto Login) */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2.5 shadow-xs">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Sample Test Credentials (Reference)</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <div className="font-bold text-purple-700">Himanshi Kalra (HR Director)</div>
                <div className="text-[11px] font-mono text-slate-500">Email: admin@company.com | Pass: password123</div>
              </div>
              <button
                type="button"
                onClick={() => fillCredential('admin@company.com', 'password123')}
                className="text-[11px] font-semibold text-indigo-600 hover:underline px-2 py-1 bg-white border border-indigo-200 rounded-lg shadow-2xs"
              >
                Use Info
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <div className="font-bold text-indigo-700">Sakshi Kumari (Cloud Architect)</div>
                <div className="text-[11px] font-mono text-slate-500">Email: john@company.com | Pass: password123</div>
              </div>
              <button
                type="button"
                onClick={() => fillCredential('john@company.com', 'password123')}
                className="text-[11px] font-semibold text-indigo-600 hover:underline px-2 py-1 bg-white border border-indigo-200 rounded-lg shadow-2xs"
              >
                Use Info
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <div className="font-bold text-emerald-700">Ishita Mukherjee (UX Lead)</div>
                <div className="text-[11px] font-mono text-slate-500">Email: emily@company.com | Pass: password123</div>
              </div>
              <button
                type="button"
                onClick={() => fillCredential('emily@company.com', 'password123')}
                className="text-[11px] font-semibold text-indigo-600 hover:underline px-2 py-1 bg-white border border-indigo-200 rounded-lg shadow-2xs"
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
