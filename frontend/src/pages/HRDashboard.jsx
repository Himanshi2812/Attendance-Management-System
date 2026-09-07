import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { ThemeContext } from '../context/ThemeContext';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  Download,
  Search,
  Filter,
  Check,
  X,
  Edit,
  ShieldCheck,
  Sliders,
  TrendingUp,
  Building,
  Save,
  Plus,
  ChevronRight,
  FileSpreadsheet,
  Upload,
  FileUp,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function HRDashboard() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('attendance');
  const [stats, setStats] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // HR Manual Override Modal
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    user_id: '',
    date: new Date().toISOString().split('T')[0],
    check_in: '09:00',
    check_out: '17:00',
    status: 'PRESENT',
    notes: 'HR manual record adjustment'
  });

  // HR Leave Decision state
  const [decisionNotes, setDecisionNotes] = useState({});

  // Excel Bulk Import Modal State
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [excelUploading, setExcelUploading] = useState(false);
  const [excelResult, setExcelResult] = useState(null);
  const [excelError, setExcelError] = useState(null);

  useEffect(() => {
    loadHRData();
  }, [dateFilter, statusFilter, searchTerm]);

  const loadHRData = async () => {
    try {
      setLoading(true);
      const [statsRes, logsRes, empRes, leavesRes, analyticsRes, settingsRes] = await Promise.all([
        API.get('/hr/stats'),
        API.get(`/hr/attendance?search=${searchTerm}&status=${statusFilter}&date=${dateFilter}`),
        API.get('/hr/employees'),
        API.get('/hr/leaves'),
        API.get('/hr/analytics'),
        API.get('/hr/settings')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (logsRes.data.success) setAttendanceLogs(logsRes.data.records);
      if (empRes.data.success) setEmployees(empRes.data.employees);
      if (leavesRes.data.success) setLeaves(leavesRes.data.requests);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data);
      if (settingsRes.data.success) setSettings(settingsRes.data.settings);
    } catch (err) {
      console.error('Error loading HR data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await API.get('/hr/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export CSV error:', err);
    }
  };

  const handleDownloadSampleExcel = async () => {
    try {
      const response = await API.get('/hr/sample-excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sample_employee_import.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download sample Excel error:', err);
    }
  };

  const handleBulkExcelUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      setExcelError('Please select an Excel (.xlsx, .xls) or CSV file first.');
      return;
    }

    setExcelUploading(true);
    setExcelError(null);
    setExcelResult(null);

    try {
      const formData = new FormData();
      formData.append('file', excelFile);

      const res = await API.post('/hr/upload-employees', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setExcelResult(res.data);
        loadHRData();
      }
    } catch (err) {
      setExcelError(err.response?.data?.message || 'Failed to process Excel file upload.');
    } finally {
      setExcelUploading(false);
    }
  };

  const handleManualOverride = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/hr/attendance/manual', overrideForm);
      if (res.data.success) {
        setShowOverrideModal(false);
        loadHRData();
      }
    } catch (err) {
      console.error('Manual override error:', err);
    }
  };

  const handleLeaveDecision = async (id, status) => {
    try {
      const res = await API.patch(`/hr/leaves/${id}/respond`, {
        status,
        hr_comments: decisionNotes[id] || ''
      });
      if (res.data.success) {
        loadHRData();
      }
    } catch (err) {
      console.error('Leave decision error:', err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/hr/settings', { settings });
      if (res.data.success) {
        alert('Shift policy updated successfully.');
      }
    } catch (err) {
      console.error('Settings save error:', err);
    }
  };

  const COLORS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed'];

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="flex items-center space-x-3 text-purple-600">
          <Clock className="w-6 h-6 animate-spin" />
          <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Loading HR Portal Data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1800px] mx-auto px-8 md:px-12 py-8 space-y-8">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
          <span>HR Operations Suite</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Executive Dashboard</span>
        </div>
      </div>

      {/* Main Banner Card */}
      <div className={`border rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs ${
        isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'
      }`}>
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrative Controls</span>
          </div>
          <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Workforce Attendance & Leave Operations
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Real-time workforce tracking, policy enforcement, and reporting controls
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => { setShowExcelModal(true); setExcelFile(null); setExcelResult(null); setExcelError(null); }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Import Excel</span>
          </button>

          <button
            onClick={() => setShowOverrideModal(true)}
            className={`px-4 py-2.5 border text-xs font-semibold rounded-lg transition flex items-center space-x-2 ${
              isDark ? 'bg-[#090d16] border-[#1f293d] text-slate-200 hover:bg-[#1f293d]' : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
            }`}
          >
            <Plus className="w-4 h-4 text-purple-600" />
            <span>Manual Override</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center space-x-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Executive Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className={`border p-6 rounded-2xl shadow-xs ${isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'}`}>
          <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Workforce</div>
          <div className={`text-3xl font-extrabold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats?.totalStaff || 0}</div>
          <div className="text-xs text-indigo-600 font-medium mt-1.5">Active staff profiles</div>
        </div>

        <div className={`border p-6 rounded-2xl shadow-xs ${isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'}`}>
          <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Present Today</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">{stats?.presentToday || 0}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1.5">{stats?.onTimeToday || 0} On Time</div>
        </div>

        <div className={`border p-6 rounded-2xl shadow-xs ${isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'}`}>
          <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Late Check-Ins</div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">{stats?.lateToday || 0}</div>
          <div className="text-xs text-amber-600 font-medium mt-1.5">Post 09:15 AM threshold</div>
        </div>

        <div className={`border p-6 rounded-2xl shadow-xs ${isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'}`}>
          <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>On Leave</div>
          <div className="text-3xl font-extrabold text-purple-600 mt-2">{stats?.onLeaveToday || 0}</div>
          <div className="text-xs text-purple-600 font-medium mt-1.5">Approved leave status</div>
        </div>

        <div className={`border p-6 rounded-2xl shadow-xs ${isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'}`}>
          <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pending Requests</div>
          <div className="text-3xl font-extrabold text-pink-600 mt-2">{stats?.pendingLeaves || 0}</div>
          <div className="text-xs text-pink-600 font-medium mt-1.5">Action required</div>
        </div>
      </div>

      {/* HR Navigation Tabs */}
      <div className={`flex border-b space-x-8 ${isDark ? 'border-[#1f293d]' : 'border-slate-200'}`}>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 text-sm font-bold transition flex items-center space-x-2 border-b-2 ${
            activeTab === 'attendance' ? 'border-indigo-600 text-indigo-600' : isDark ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Attendance Log</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`pb-3 text-sm font-bold transition flex items-center space-x-2 border-b-2 ${
            activeTab === 'employees' ? 'border-indigo-600 text-indigo-600' : isDark ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employee Directory ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`pb-3 text-sm font-bold transition flex items-center space-x-2 border-b-2 ${
            activeTab === 'leaves' ? 'border-indigo-600 text-indigo-600' : isDark ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Leave Approvals ({leaves.filter(l => l.status === 'PENDING').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm font-bold transition flex items-center space-x-2 border-b-2 ${
            activeTab === 'analytics' ? 'border-indigo-600 text-indigo-600' : isDark ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Visual Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-sm font-bold transition flex items-center space-x-2 border-b-2 ${
            activeTab === 'settings' ? 'border-indigo-600 text-indigo-600' : isDark ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Shift Policies</span>
        </button>
      </div>

      {/* TAB 1: Attendance Log */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Structured Filters */}
          <div className={`border p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs ${
            isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search name, code, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full border rounded-lg px-4 pl-9 py-2 text-xs ${
                    isDark ? 'bg-[#090d16] border-[#1f293d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`border rounded-lg px-3.5 py-2 text-xs ${
                  isDark ? 'bg-[#090d16] border-[#1f293d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="">All Statuses</option>
                <option value="PRESENT">PRESENT</option>
                <option value="LATE">LATE</option>
                <option value="HALF_DAY">HALF DAY</option>
                <option value="ON_LEAVE">ON LEAVE</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className={`border rounded-lg px-3.5 py-2 text-xs ${
                  isDark ? 'bg-[#090d16] border-[#1f293d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
              {dateFilter && (
                <button onClick={() => setDateFilter('')} className="text-xs text-indigo-600 font-semibold hover:underline">
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Full Width Table */}
          <div className={`border rounded-2xl overflow-hidden shadow-xs ${
            isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`text-xs font-bold uppercase tracking-wider border-b ${
                    isDark ? 'bg-[#090d16] border-[#1f293d] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <th className="py-3.5 px-6">Employee</th>
                    <th className="py-3.5 px-6">Department</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Check In</th>
                    <th className="py-3.5 px-6">Check Out</th>
                    <th className="py-3.5 px-6">Hours</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${isDark ? 'divide-[#1f293d]' : 'divide-slate-100'}`}>
                  {attendanceLogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-slate-400">No records matching query.</td>
                    </tr>
                  ) : (
                    attendanceLogs.map((log) => (
                      <tr key={log.id} className={isDark ? 'hover:bg-[#1a243b]' : 'hover:bg-slate-50/80'}>
                        <td className="py-3.5 px-6">
                          <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{log.employee_name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{log.employee_code} • {log.employee_email}</div>
                        </td>
                        <td className="py-3.5 px-6 text-slate-500">{log.department || 'General'}</td>
                        <td className="py-3.5 px-6 font-mono text-slate-500">{log.date}</td>
                        <td className="py-3.5 px-6 font-mono text-slate-500">{log.check_in || '--:--'}</td>
                        <td className="py-3.5 px-6 font-mono text-slate-500">{log.check_out || '--:--'}</td>
                        <td className={`py-3.5 px-6 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{log.working_hours ? `${log.working_hours} h` : '--'}</td>
                        <td className="py-3.5 px-6">
                          {log.status === 'PRESENT' && <span className="badge-present px-2.5 py-0.5 rounded text-[10px] font-bold">PRESENT</span>}
                          {log.status === 'LATE' && <span className="badge-late px-2.5 py-0.5 rounded text-[10px] font-bold">LATE</span>}
                          {log.status === 'HALF_DAY' && <span className="badge-half-day px-2.5 py-0.5 rounded text-[10px] font-bold">HALF DAY</span>}
                          {log.status === 'ON_LEAVE' && <span className="badge-leave px-2.5 py-0.5 rounded text-[10px] font-bold">ON LEAVE</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Employee Directory */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className={`border p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
            isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'
          }`}>
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Staff Directory ({employees.length} Active Profiles)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage workforce profiles, leave balances, and bulk import data</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadSampleExcel}
                className={`px-3.5 py-2 border text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 ${
                  isDark ? 'bg-[#090d16] border-[#1f293d] text-slate-300 hover:bg-[#1f293d]' : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sample Excel Template</span>
              </button>

              <button
                onClick={() => { setShowExcelModal(true); setExcelFile(null); setExcelResult(null); setExcelError(null); }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Bulk Import Excel / CSV</span>
              </button>
            </div>
          </div>

          <div className={`border rounded-2xl overflow-hidden shadow-xs ${
            isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'
          }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-xs font-bold uppercase tracking-wider border-b ${
                  isDark ? 'bg-[#090d16] border-[#1f293d] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Department & Job Title</th>
                  <th className="py-3.5 px-6">Leave Quotas</th>
                  <th className="py-3.5 px-6">Deductions</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs ${isDark ? 'divide-[#1f293d]' : 'divide-slate-100'}`}>
                {employees.map((emp) => (
                  <tr key={emp.id} className={isDark ? 'hover:bg-[#1a243b]' : 'hover:bg-slate-50/80'}>
                    <td className="py-3.5 px-6">
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{emp.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{emp.employee_code} • {emp.email}</div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        emp.role === 'HR_ADMIN' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{emp.department}</div>
                      <div className="text-[10px] text-slate-400">{emp.position}</div>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-[11px]">
                      <span className="text-indigo-600 font-semibold">CL: {emp.casual_leave || 0}</span> |{' '}
                      <span className="text-purple-600 font-semibold">SL: {emp.sick_leave || 0}</span> |{' '}
                      <span className="text-emerald-600 font-semibold">EL: {emp.earned_leave || 0}</span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-red-600">
                      -{emp.deducted_leave || 0} Days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {/* TAB 3: Leave Approvals Queue */}
      {activeTab === 'leaves' && (
        <div className={`border rounded-2xl p-6 space-y-5 shadow-xs ${
          isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'
        }`}>
          <h2 className={`text-sm font-bold border-b pb-3 ${isDark ? 'text-white border-[#1f293d]' : 'text-slate-900 border-slate-100'}`}>
            Pending Employee Leave Applications
          </h2>

          {leaves.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No leave requests found.</p>
          ) : (
            <div className="space-y-4">
              {leaves.map((req) => (
                <div key={req.id} className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isDark ? 'bg-[#090d16] border-[#1f293d]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{req.employee_name}</span>
                      <span className="text-[11px] text-slate-400">({req.department})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="text-xs text-indigo-600 font-semibold">
                      Type: {req.leave_type} Leave | Duration: {req.start_date} to {req.end_date} ({req.total_days} days)
                    </div>
                    {req.reason && <div className="text-xs text-slate-500 italic">Reason: "{req.reason}"</div>}
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
                      <input
                        type="text"
                        placeholder="HR Comment..."
                        value={decisionNotes[req.id] || ''}
                        onChange={(e) => setDecisionNotes({ ...decisionNotes, [req.id]: e.target.value })}
                        className={`border rounded-lg px-3 py-1.5 text-xs w-full sm:w-48 ${
                          isDark ? 'bg-[#111827] border-[#1f293d] text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleLeaveDecision(req.id, 'APPROVED')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleLeaveDecision(req.id, 'REJECTED')}
                          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Analytics Graphs */}
      {activeTab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`border p-6 rounded-2xl space-y-3 shadow-xs ${isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Attendance Log Volume</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f293d' : '#e2e8f0'} />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#090d16' : '#ffffff', borderColor: isDark ? '#1f293d' : '#cbd5e1', color: isDark ? '#fff' : '#0f172a', fontSize: '11px', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`border p-6 rounded-2xl space-y-3 shadow-xs ${isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Department Headcount Share</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.departments}
                    dataKey="count"
                    nameKey="department"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ department, count }) => `${department}: ${count}`}
                  >
                    {analytics.departments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#090d16' : '#ffffff', borderColor: isDark ? '#1f293d' : '#cbd5e1', color: isDark ? '#fff' : '#0f172a', fontSize: '11px', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Shift Policy Settings */}
      {activeTab === 'settings' && (
        <div className={`border p-6 rounded-2xl max-w-xl space-y-4 shadow-xs ${isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'}`}>
          <h2 className={`text-sm font-bold border-b pb-3 ${isDark ? 'text-white border-[#1f293d]' : 'text-slate-900 border-slate-100'}`}>
            Shift Schedule & Policy Parameters
          </h2>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Work Start Time</label>
                <input
                  type="text"
                  value={settings.work_start_time || '09:00'}
                  onChange={(e) => setSettings({ ...settings, work_start_time: e.target.value })}
                  className={`w-full border rounded-lg px-3.5 py-2 text-xs ${
                    isDark ? 'bg-[#090d16] border-[#1f293d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Work End Time</label>
                <input
                  type="text"
                  value={settings.work_end_time || '17:00'}
                  onChange={(e) => setSettings({ ...settings, work_end_time: e.target.value })}
                  className={`w-full border rounded-lg px-3.5 py-2 text-xs ${
                    isDark ? 'bg-[#090d16] border-[#1f293d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Grace Period (Minutes)</label>
              <input
                type="number"
                value={settings.grace_period_mins || 15}
                onChange={(e) => setSettings({ ...settings, grace_period_mins: e.target.value })}
                className={`w-full border rounded-lg px-3.5 py-2 text-xs ${
                  isDark ? 'bg-[#090d16] border-[#1f293d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Late Check-In Penalty Threshold</label>
              <input
                type="number"
                value={settings.late_count_deduction_threshold || 3}
                onChange={(e) => setSettings({ ...settings, late_count_deduction_threshold: e.target.value })}
                className={`w-full border rounded-lg px-3.5 py-2 text-xs ${
                  isDark ? 'bg-[#090d16] border-[#1f293d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
              <p className="text-[11px] text-slate-500 mt-1">Every N late arrivals deduct 0.5 days from leave balance.</p>
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Policy Settings</span>
            </button>
          </form>
        </div>
      )}

      {/* HR Manual Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className={`border p-6 rounded-2xl w-full max-w-md shadow-2xl ${
            isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-200">
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Manual Record Override</h3>
              <button onClick={() => setShowOverrideModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleManualOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Select Employee</label>
                <select
                  required
                  value={overrideForm.user_id}
                  onChange={(e) => setOverrideForm({ ...overrideForm, user_id: e.target.value })}
                  className={`w-full border rounded-lg px-3.5 py-2 text-xs ${
                    isDark ? 'bg-[#090d16] border-[#1f293d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="">Select Employee...</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.employee_code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={overrideForm.date}
                  onChange={(e) => setOverrideForm({ ...overrideForm, date: e.target.value })}
                  className={`w-full border rounded-lg px-3.5 py-2 text-xs ${
                    isDark ? 'bg-[#090d16] border-[#1f293d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Check In Time</label>
                  <input
                    type="time"
                    value={overrideForm.check_in}
                    onChange={(e) => setOverrideForm({ ...overrideForm, check_in: e.target.value })}
                    className={`w-full border rounded-lg px-3.5 py-2 text-xs ${
                      isDark ? 'bg-[#090d16] border-[#1f293d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Check Out Time</label>
                  <input
                    type="time"
                    value={overrideForm.check_out}
                    onChange={(e) => setOverrideForm({ ...overrideForm, check_out: e.target.value })}
                    className={`w-full border rounded-lg px-3.5 py-2 text-xs ${
                      isDark ? 'bg-[#090d16] border-[#1f293d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                <select
                  value={overrideForm.status}
                  onChange={(e) => setOverrideForm({ ...overrideForm, status: e.target.value })}
                  className={`w-full border rounded-lg px-3.5 py-2 text-xs ${
                    isDark ? 'bg-[#090d16] border-[#1f293d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="LATE">LATE</option>
                  <option value="HALF_DAY">HALF DAY</option>
                  <option value="ON_LEAVE">ON LEAVE</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Excel Import Modal */}
      {showExcelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className={`border p-6 rounded-2xl w-full max-w-lg shadow-2xl space-y-4 ${
            isDark ? 'bg-[#111827] border-[#1f293d]' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Bulk Import Employee Data</h3>
              </div>
              <button onClick={() => setShowExcelModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Upload an Excel (<span className="font-mono text-emerald-600 font-semibold">.xlsx, .xls</span>) or CSV file containing staff records. New staff will receive default leave quotas automatically.
            </p>

            <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
              isDark ? 'bg-[#090d16] border-[#1f293d]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="space-y-0.5">
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Need a sample Excel template?</div>
                <div className="text-[11px] text-slate-500">Download formatted spreadsheet with sample headers.</div>
              </div>
              <button
                type="button"
                onClick={handleDownloadSampleExcel}
                className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg font-semibold text-xs transition shrink-0 flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template</span>
              </button>
            </div>

            <form onSubmit={handleBulkExcelUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Select Excel / CSV File</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  excelFile ? 'border-emerald-500 bg-emerald-50/20' : isDark ? 'border-[#1f293d] bg-[#090d16]' : 'border-slate-300 bg-slate-50'
                }`}>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        setExcelFile(e.target.files[0]);
                        setExcelError(null);
                      }
                    }}
                    className="hidden"
                    id="excel-file-input"
                  />
                  <label htmlFor="excel-file-input" className="cursor-pointer space-y-2 block">
                    <FileUp className={`w-8 h-8 mx-auto ${excelFile ? 'text-emerald-600' : 'text-slate-400'}`} />
                    {excelFile ? (
                      <div>
                        <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{excelFile.name}</div>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">{(excelFile.size / 1024).toFixed(1)} KB • Ready to upload</div>
                      </div>
                    ) : (
                      <div>
                        <div className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Click to browse or drag Excel / CSV file</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Supports .xlsx, .xls, .csv up to 10MB</div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {excelError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{excelError}</span>
                </div>
              )}

              {excelResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl space-y-2 text-xs">
                  <div className="font-bold flex items-center space-x-2 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{excelResult.message}</span>
                  </div>
                  {excelResult.errors && excelResult.errors.length > 0 && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200 space-y-1 max-h-28 overflow-y-auto">
                      <div className="font-semibold">Import Notes / Skipped Records:</div>
                      {excelResult.errors.map((errNote, idx) => (
                        <div key={idx}>• {errNote}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowExcelModal(false)}
                  className="px-4 py-2.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={excelUploading || !excelFile}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition flex items-center space-x-2 shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>{excelUploading ? 'Importing Employees...' : 'Upload & Import Staff'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
