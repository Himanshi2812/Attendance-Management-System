import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Building, Briefcase, ShieldCheck, ArrowRight, Building2 } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    department: 'Software Engineering',
    position: 'Senior Software Engineer',
    employee_code: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const isDark = theme === 'dark';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-[calc(100vh-73px)] flex items-center justify-center p-6 transition-colors duration-200 ${
      isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className={`inline-flex p-3 rounded-xl border ${
            isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
          }`}>
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Create Employee Account</h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Register new staff profile in InnerEye Corporate Directory</p>
        </div>

        <div className={`border p-6 rounded-2xl shadow-xl space-y-4 transition-colors duration-200 ${
          isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'
        }`}>
          {error && (
            <div className={`p-3 rounded-lg border text-xs font-medium ${
              isDark ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Role Selector */}
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Account Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'EMPLOYEE' })}
                  className={`p-2.5 rounded-lg border flex items-center justify-center space-x-2 text-xs font-semibold transition ${
                    formData.role === 'EMPLOYEE'
                      ? isDark
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400 shadow-xs'
                        : 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                      : isDark
                      ? 'bg-[#090d16] border-[#1f293d] text-slate-400 hover:text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Employee</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'HR_ADMIN' })}
                  className={`p-2.5 rounded-lg border flex items-center justify-center space-x-2 text-xs font-semibold transition ${
                    formData.role === 'HR_ADMIN'
                      ? isDark
                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-400 shadow-xs'
                        : 'bg-purple-50 border-purple-300 text-purple-700 shadow-xs'
                      : isDark
                      ? 'bg-[#090d16] border-[#1f293d] text-slate-400 hover:text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>HR Administrator</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Swakshi Singh"
                  className={`w-full border rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none transition ${
                    isDark
                      ? 'bg-[#090d16] border-[#1f293d] text-slate-100 placeholder-slate-500 focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-600'
                  }`}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="swakshi@company.com"
                  className={`w-full border rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none transition ${
                    isDark
                      ? 'bg-[#090d16] border-[#1f293d] text-slate-100 placeholder-slate-500 focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-600'
                  }`}
                />
              </div>
            </div>

            {/* Department & Position */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Department</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Engineering"
                    className={`w-full border rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none transition ${
                      isDark
                        ? 'bg-[#090d16] border-[#1f293d] text-slate-100 placeholder-slate-500 focus:border-indigo-500'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-600'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Job Title</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="Software Engineer"
                    className={`w-full border rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none transition ${
                      isDark
                        ? 'bg-[#090d16] border-[#1f293d] text-slate-100 placeholder-slate-500 focus:border-indigo-500'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-600'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
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
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Registering...</span>
              ) : (
                <>
                  <span>Create Employee Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className={`text-center text-xs pt-2 border-t ${isDark ? 'text-slate-400 border-[#1f293d]' : 'text-slate-500 border-slate-100'}`}>
            Already registered?{' '}
            <Link to="/login" className="text-indigo-500 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
