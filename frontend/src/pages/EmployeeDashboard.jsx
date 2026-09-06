import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import API from '../services/api';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Briefcase,
  Plus,
  FileText,
  TrendingUp,
  User,
  X,
  Check,
  Send,
  Timer,
  Building,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [todayState, setTodayState] = useState(null);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [leaveData, setLeaveData] = useState({ requests: [], balance: null });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Leave Modal State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'CASUAL',
    start_date: '',
    end_date: '',
    total_days: 1,
    reason: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [todayRes, historyRes, leaveRes] = await Promise.all([
        API.get('/attendance/today'),
        API.get('/attendance/my-history'),
        API.get('/leaves/my-leaves')
      ]);

      if (todayRes.data.success) setTodayState(todayRes.data);
      if (historyRes.data.success) {
        setHistory(historyRes.data.records);
        setSummary(historyRes.data.summary);
      }
      if (leaveRes.data.success) setLeaveData(leaveRes.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await API.post('/attendance/check-in', { notes: 'Standard Web Single Sign-On Clock In' });
      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message });
        loadDashboardData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Check-in failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await API.post('/attendance/check-out', { notes: 'Standard Web Clock Out' });
      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message });
        loadDashboardData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Check-out failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/leaves/apply', leaveForm);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Leave application submitted for HR review.' });
        setShowLeaveModal(false);
        setLeaveForm({ leave_type: 'CASUAL', start_date: '', end_date: '', total_days: 1, reason: '' });
        loadDashboardData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit leave' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="flex items-center space-x-3 text-indigo-600">
          <Clock className="w-6 h-6 animate-spin" />
          <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Loading Portal Records...</span>
        </div>
      </div>
    );
  }

  const today = todayState?.today;
  const isCheckedIn = !!(today && today.check_in && !today.check_out);
  const isCheckedOut = !!(today && today.check_in && today.check_out);

  const totalPresentDays = history.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
  const totalWorkedHours = history.reduce((acc, r) => acc + (r.working_hours || 0), 0).toFixed(1);

  return (
    <div className="w-full max-w-[1800px] mx-auto px-8 md:px-12 py-8 space-y-8">
      {/* Breadcrumb Header */}
      <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <span>Employee Self Service</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Attendance & Leave Dashboard</span>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Main Banner Card */}
      <div className={`border rounded-2xl p-8 md:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs ${
        isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'
      }`}>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 border border-indigo-200 px-3 py-0.5 rounded">
              {user?.department}
            </span>
            <span className="text-xs text-slate-500 font-medium">• {user?.position}</span>
          </div>

          <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Welcome, <span className="text-indigo-600">{user?.name}</span>
          </h1>

          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500">
            <div>Employee Code: <span className={`font-mono font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{user?.employee_code}</span></div>
            <div>Shift Target: <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>09:00 AM - 05:00 PM</span> (8 Hours)</div>
            <div>Location: <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Corporate HQ / Remote VPN</span></div>
          </div>
        </div>

        {/* Check-In Terminal Widget */}
        <div className={`w-full lg:w-auto border rounded-xl p-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 ${
          isDark ? 'bg-[#090d16] border-[#1f293d]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="text-center sm:text-left space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Shift Status Today</div>
            <div>
              {isCheckedIn ? (
                <span className="badge-present px-3.5 py-1 rounded text-xs font-bold inline-flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>CHECKED IN ({today.check_in})</span>
                </span>
              ) : isCheckedOut ? (
                <span className="badge-late px-3.5 py-1 rounded text-xs font-bold inline-flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CHECKED OUT ({today.working_hours}h)</span>
                </span>
              ) : (
                <span className="bg-slate-200 text-slate-700 px-3.5 py-1 rounded text-xs font-medium border border-slate-300">
                  NOT CHECKED IN
                </span>
              )}
            </div>
          </div>

          <div className="w-full sm:w-auto">
            {!isCheckedIn && !isCheckedOut && (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center justify-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>CLOCK IN NOW</span>
              </button>
            )}

            {isCheckedIn && (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CLOCK OUT NOW</span>
              </button>
            )}

            {isCheckedOut && (
              <div className="text-xs text-emerald-700 font-semibold px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                Shift Concluded Today
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`border rounded-2xl p-6 shadow-xs ${isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Days Present</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-4">
            <div className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalPresentDays} Days</div>
            <div className="text-xs text-slate-500 mt-1.5">Logged attendance</div>
          </div>
        </div>

        <div className={`border rounded-2xl p-6 shadow-xs ${isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Late Check-Ins</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-4">
            <div className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{summary?.lateCount || 0} Times</div>
            <div className="text-xs text-amber-600 mt-1.5">Policy: 3 Late = 0.5d Penalty</div>
          </div>
        </div>

        <div className={`border rounded-2xl p-6 shadow-xs ${isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Worked Duration</span>
            <Timer className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="mt-4">
            <div className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalWorkedHours} hrs</div>
            <div className="text-xs text-indigo-600 mt-1.5">Total recorded hours</div>
          </div>
        </div>

        <div className={`border rounded-2xl p-6 shadow-xs ${isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Leave Balance</span>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div className="mt-4">
            <div className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {((leaveData.balance?.sick_leave || 0) + (leaveData.balance?.casual_leave || 0) + (leaveData.balance?.earned_leave || 0)).toFixed(1)} Days
            </div>
            <div className="text-xs text-red-600 mt-1.5">
              Deducted: -{summary?.totalDeduction || 0} Days
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Attendance Table & My Applications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Logs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Attendance Logs</h2>
              <span className="text-xs text-slate-500">Recent records</span>
            </div>

            <div className={`border rounded-2xl overflow-hidden shadow-xs ${isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`text-xs font-bold uppercase tracking-wider border-b ${
                      isDark ? 'bg-[#090d16] border-[#1f293d] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      <th className="py-3.5 px-6">Date</th>
                      <th className="py-3.5 px-6">Check In</th>
                      <th className="py-3.5 px-6">Check Out</th>
                      <th className="py-3.5 px-6">Hours</th>
                      <th className="py-3.5 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y text-xs ${isDark ? 'divide-[#1f293d]' : 'divide-slate-100'}`}>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-slate-400">No attendance logs recorded.</td>
                      </tr>
                    ) : (
                      history.map((record) => (
                        <tr key={record.id} className={isDark ? 'hover:bg-[#1a243b]' : 'hover:bg-slate-50/80'}>
                          <td className={`py-3.5 px-6 font-mono font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{record.date}</td>
                          <td className="py-3.5 px-6 text-slate-500 font-mono">{record.check_in || '--:--'}</td>
                          <td className="py-3.5 px-6 text-slate-500 font-mono">{record.check_out || '--:--'}</td>
                          <td className={`py-3.5 px-6 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {record.working_hours ? `${record.working_hours} h` : '--'}
                          </td>
                          <td className="py-3.5 px-6">
                            {record.status === 'PRESENT' && <span className="badge-present px-2.5 py-0.5 rounded text-[11px] font-semibold">PRESENT</span>}
                            {record.status === 'LATE' && <span className="badge-late px-2.5 py-0.5 rounded text-[11px] font-semibold">LATE</span>}
                            {record.status === 'HALF_DAY' && <span className="badge-half-day px-2.5 py-0.5 rounded text-[11px] font-semibold">HALF DAY</span>}
                            {record.status === 'ABSENT' && <span className="badge-absent px-2.5 py-0.5 rounded text-[11px] font-semibold">ABSENT</span>}
                            {record.status === 'ON_LEAVE' && <span className="badge-leave px-2.5 py-0.5 rounded text-[11px] font-semibold">ON LEAVE</span>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* My Applications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>My Applications</h2>
              <span className="text-xs text-slate-500">Leave request status tracking</span>
            </div>

            <div className={`border rounded-2xl p-5 shadow-xs ${isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {leaveData.requests.length === 0 ? (
                  <p className="text-xs text-slate-400 col-span-2">No leave requests submitted yet.</p>
                ) : (
                  leaveData.requests.map((req) => (
                    <div key={req.id} className={`p-4 rounded-xl border space-y-2 ${
                      isDark ? 'bg-[#090d16] border-[#1f293d]' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{req.leave_type} LEAVE ({req.total_days}d)</span>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded ${
                          req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">{req.start_date} to {req.end_date}</div>
                      {req.reason && <div className="text-xs italic text-slate-500">"{req.reason}"</div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Leave Quotas & Policy Rules */}
        <div className="space-y-6">
          <div className={`border rounded-2xl p-6 space-y-5 shadow-xs ${isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'}`}>
            <div className={`flex items-center justify-between border-b pb-4 ${isDark ? 'border-[#1f293d]' : 'border-slate-100'}`}>
              <div>
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Leave Quotas</h3>
                <p className="text-xs text-slate-500 mt-0.5">Annual balance allocation</p>
              </div>
              <button
                onClick={() => setShowLeaveModal(true)}
                className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Apply Leave</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className={`flex items-center justify-between p-3.5 rounded-xl border text-xs ${
                isDark ? 'bg-[#090d16] border-[#1f293d]' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={isDark ? 'text-slate-300 font-medium' : 'text-slate-700 font-medium'}>Casual Leave (CL)</span>
                <span className="font-bold text-indigo-600 text-sm">{leaveData.balance?.casual_leave || 0} Days</span>
              </div>
              <div className={`flex items-center justify-between p-3.5 rounded-xl border text-xs ${
                isDark ? 'bg-[#090d16] border-[#1f293d]' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={isDark ? 'text-slate-300 font-medium' : 'text-slate-700 font-medium'}>Sick Leave (SL)</span>
                <span className="font-bold text-purple-600 text-sm">{leaveData.balance?.sick_leave || 0} Days</span>
              </div>
              <div className={`flex items-center justify-between p-3.5 rounded-xl border text-xs ${
                isDark ? 'bg-[#090d16] border-[#1f293d]' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={isDark ? 'text-slate-300 font-medium' : 'text-slate-700 font-medium'}>Earned Leave (EL)</span>
                <span className="font-bold text-emerald-600 text-sm">{leaveData.balance?.earned_leave || 0} Days</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs">
                <span className="text-red-800 font-medium">Policy Penalty Deductions</span>
                <span className="font-bold text-red-600 text-sm">-{summary?.totalDeduction || 0} Days</span>
              </div>
            </div>

            {/* Attendance & Leave Policy Guide Box */}
            <div className={`p-4 rounded-xl border space-y-2 text-xs ${
              isDark ? 'bg-[#090d16] border-[#1f293d] text-slate-300' : 'bg-indigo-50/50 border-indigo-100 text-slate-700'
            }`}>
              <div className="font-bold text-indigo-600 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Attendance Policy Guide</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-500">
                <li className="flex items-start space-x-1.5">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span><strong>≥ 8.0 hrs:</strong> Marked PRESENT (0 deduction)</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span><strong>4.0 to &lt; 8.0 hrs:</strong> HALF DAY (0.5 day deduction)</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span><strong>&lt; 4.0 hrs / Missed:</strong> ABSENT (1.0 day deduction)</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span><strong>Deduction Sequence:</strong> Casual → Sick → Unpaid</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className={`border p-6 rounded-2xl w-full max-w-md shadow-2xl ${
            isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-200">
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>New Leave Application</h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Leave Category</label>
                <select
                  value={leaveForm.leave_type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                  className={`w-full border rounded-lg px-3.5 py-2 text-xs ${
                    isDark ? 'bg-[#090d16] border-[#1f293d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="CASUAL">Casual Leave (CL)</option>
                  <option value="SICK">Sick Leave (SL)</option>
                  <option value="EARNED">Earned Leave (EL)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.start_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                    className={`w-full border rounded-lg px-3.5 py-2 text-xs ${
                      isDark ? 'bg-[#090d16] border-[#1f293d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.end_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                    className={`w-full border rounded-lg px-3.5 py-2 text-xs ${
                      isDark ? 'bg-[#090d16] border-[#1f293d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Total Days</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={leaveForm.total_days}
                  onChange={(e) => setLeaveForm({ ...leaveForm, total_days: parseFloat(e.target.value) })}
                  className={`w-full border rounded-lg px-3.5 py-2 text-xs ${
                    isDark ? 'bg-[#090d16] border-[#1f293d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Reason</label>
                <textarea
                  rows="3"
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="State official reason..."
                  className={`w-full border rounded-lg px-3.5 py-2 text-xs ${
                    isDark ? 'bg-[#090d16] border-[#1f293d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4.5 py-2.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
