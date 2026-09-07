import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { LogOut, ShieldCheck, Clock, User, ChevronDown, Sparkles, Building2, Bell, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout, login } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickSwitch = async (email) => {
    try {
      await login(email, 'password123');
      setShowDemoMenu(false);
      navigate('/');
    } catch (err) {
      console.error('Quick switch error:', err);
    }
  };

  const isDark = theme === 'dark';

  return (
    <header className={`${isDark ? 'bg-[#0e131f] border-[#1f293d] text-white' : 'bg-white border-slate-200 text-slate-900'} border-b sticky top-0 z-50 px-4 md:px-12 py-3.5 flex items-center justify-between shadow-xs transition-colors duration-200 w-full`}>
      {/* Brand & Workspace Indicator */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className={`text-sm md:text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                InnerEye HR
              </span>
              <span className={`text-[9px] md:text-[10px] font-semibold uppercase px-1.5 md:px-2 py-0.5 rounded ${
                isDark ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                Enterprise
              </span>
            </div>
            <p className={`hidden sm:block text-[11px] md:text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Global Attendance Portal</p>
          </div>
        </div>
      </div>

      {/* Center Live Server Time */}
      <div className={`hidden lg:flex items-center space-x-2.5 border px-4 py-1.5 rounded-lg text-xs ${
        isDark ? 'bg-[#131b2e] border-[#1f293d]' : 'bg-slate-100/80 border-slate-200'
      }`}>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className={isDark ? 'text-slate-400 font-medium' : 'text-slate-500 font-medium'}>HQ Server Time:</span>
        <span className={`font-mono font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{time}</span>
      </div>

      {/* Right Navigation, Theme Toggle & User Actions */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg border transition flex items-center space-x-1.5 text-xs font-semibold ${
            isDark
              ? 'bg-[#131b2e] border-[#1f293d] text-amber-300 hover:bg-[#1a243b]'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          <span className="hidden md:inline">{isDark ? 'Light' : 'Dark'}</span>
        </button>

        {user ? (
          <div className="flex items-center space-x-2 md:space-x-3.5">
            {/* Profile Avatar Badge */}
            <div className={`flex items-center space-x-2 md:space-x-3 border px-2.5 md:px-3.5 py-1.5 rounded-lg ${
              isDark ? 'bg-[#131b2e] border-[#1f293d]' : 'bg-slate-100/80 border-slate-200'
            }`}>
              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                user.role === 'HR_ADMIN' ? 'bg-purple-600' : 'bg-indigo-600'
              }`}>
                {user.name.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <div className={`text-xs font-semibold leading-none ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{user.name}</div>
                <div className={`text-[10px] font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {user.role === 'HR_ADMIN' ? 'HR Administrator' : user.position || 'Employee'}
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className={`p-1.5 md:p-2 rounded-lg transition ${
                isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
              }`}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/login')}
              className={`text-xs font-medium px-2.5 py-1.5 ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg shadow-xs transition"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
