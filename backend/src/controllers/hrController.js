const { getOne, query, execute } = require('../database/db');

async function getDashboardStats(req, res) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const totalStaffRow = await getOne("SELECT COUNT(*) as count FROM users WHERE role = 'EMPLOYEE'");
    const totalStaff = totalStaffRow ? totalStaffRow.count : 0;

    const todayAttendance = await query("SELECT status FROM attendance WHERE date = ?", [todayStr]);

    let presentToday = 0;
    let lateToday = 0;
    let onLeaveToday = 0;
    let halfDayToday = 0;

    todayAttendance.forEach((r) => {
      if (r.status === 'PRESENT') presentToday++;
      if (r.status === 'LATE') lateToday++;
      if (r.status === 'ON_LEAVE') onLeaveToday++;
      if (r.status === 'HALF_DAY') halfDayToday++;
    });

    const absentToday = Math.max(0, totalStaff - (presentToday + lateToday + onLeaveToday + halfDayToday));

    const pendingLeaveRow = await getOne("SELECT COUNT(*) as count FROM leave_requests WHERE status = 'PENDING'");
    const pendingLeaves = pendingLeaveRow ? pendingLeaveRow.count : 0;

    res.json({
      success: true,
      stats: {
        totalStaff,
        presentToday: presentToday + lateToday, // Total present
        onTimeToday: presentToday,
        lateToday,
        onLeaveToday,
        halfDayToday,
        absentToday,
        pendingLeaves
      }
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ success: false, message: 'Error gathering HR dashboard statistics' });
  }
}

async function getAnalytics(req, res) {
  try {
    // Attendance trend for the last 14 days
    const trendRows = await query(`
      SELECT date, status, COUNT(*) as count
      FROM attendance
      GROUP BY date, status
      ORDER BY date ASC
      LIMIT 100
    `);

    // Department breakdown
    const deptRows = await query(`
      SELECT department, COUNT(*) as count
      FROM users
      WHERE role = 'EMPLOYEE'
      GROUP BY department
    `);

    res.json({
      success: true,
      trends: trendRows,
      departments: deptRows
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    res.status(500).json({ success: false, message: 'Error retrieving analytics data' });
  }
}

async function getEmployees(req, res) {
  try {
    const employees = await query(`
      SELECT u.id, u.name, u.email, u.role, u.department, u.position, u.employee_code, u.join_date,
             lb.sick_leave, lb.casual_leave, lb.earned_leave, lb.deducted_leave
      FROM users u
      LEFT JOIN leave_balances lb ON u.id = lb.user_id
      ORDER BY u.name ASC
    `);

    res.json({
      success: true,
      employees
    });
  } catch (err) {
    console.error('getEmployees error:', err);
    res.status(500).json({ success: false, message: 'Error retrieving employee directory' });
  }
}

async function getCompanySettings(req, res) {
  try {
    const settings = await query('SELECT * FROM company_settings');
    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    res.json({
      success: true,
      settings: settingsMap,
      raw: settings
    });
  } catch (err) {
    console.error('getCompanySettings error:', err);
    res.status(500).json({ success: false, message: 'Error loading settings' });
  }
}

async function updateCompanySettings(req, res) {
  try {
    const { settings } = req.body; // object { key: value }

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Settings payload must be an object' });
    }

    for (const [key, value] of Object.entries(settings)) {
      await execute(
        'INSERT OR REPLACE INTO company_settings (key, value) VALUES (?, ?)',
        [key, String(value)]
      );
    }

    // Also update primary shift if work_start_time / work_end_time updated
    if (settings.work_start_time || settings.work_end_time || settings.grace_period_mins) {
      await execute(
        `UPDATE shifts SET 
          start_time = COALESCE(?, start_time),
          end_time = COALESCE(?, end_time),
          grace_period_mins = COALESCE(?, grace_period_mins)
         WHERE id = 1`,
        [settings.work_start_time, settings.work_end_time, settings.grace_period_mins]
      );
    }

    res.json({
      success: true,
      message: 'Company work settings updated successfully'
    });
  } catch (err) {
    console.error('updateCompanySettings error:', err);
    res.status(500).json({ success: false, message: 'Failed to update company settings' });
  }
}

async function exportReport(req, res) {
  try {
    const records = await query(`
      SELECT a.date, u.employee_code, u.name, u.department, u.position,
             a.check_in, a.check_out, a.working_hours, a.overtime_hours, a.status, a.notes
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.date DESC, u.name ASC
    `);

    // Convert to CSV
    let csv = 'Date,Employee Code,Name,Department,Position,Check In,Check Out,Worked Hours,Overtime Hours,Status,Notes\n';

    records.forEach((r) => {
      csv += `"${r.date}","${r.employee_code || ''}","${r.name}","${r.department || ''}","${r.position || ''}","${r.check_in || ''}","${r.check_out || ''}",${r.working_hours || 0},${r.overtime_hours || 0},"${r.status}","${r.notes || ''}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance_report.csv"');
    res.send(csv);
  } catch (err) {
    console.error('exportReport error:', err);
    res.status(500).json({ success: false, message: 'Error generating report CSV' });
  }
}

module.exports = {
  getDashboardStats,
  getAnalytics,
  getEmployees,
  getCompanySettings,
  updateCompanySettings,
  exportReport
};
