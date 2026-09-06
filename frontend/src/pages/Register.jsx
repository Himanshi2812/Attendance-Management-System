import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Building, Briefcase, ShieldCheck, UserCheck, ArrowRight, Building2 } from 'lucide-react';

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
  const navigate = useNavigate();

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
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Employee Account</h2>
          <p className="text-xs text-slate-500">Register new staff profile in InnerEye Corporate Directory</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xl space-y-4">
          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'EMPLOYEE' })}
                  className={`p-2.5 rounded border flex items-center justify-center space-x-2 text-xs font-semibold transition ${
                    formData.role === 'EMPLOYEE'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Employee</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'HR_ADMIN' })}
                  className={`p-2.5 rounded border flex items-center justify-center space-x-2 text-xs font-semibold transition ${
                    formData.role === 'HR_ADMIN'
                      ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-xs'
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full bg-slate-50 border border-slate-200 rounded pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="eleanor@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 transition"
                />
              </div>
            </div>

            {/* Department & Position */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Engineering"
                    className="w-full bg-slate-50 border border-slate-200 rounded pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="Software Engineer"
                    className="w-full bg-slate-50 border border-slate-200 rounded pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
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
                <span>Registering...</span>
              ) : (
                <>
                  <span>Create Employee Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
