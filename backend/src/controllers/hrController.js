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

async function uploadEmployeesExcel(req, res) {
  try {
    const xlsx = require('xlsx');
    const bcrypt = require('bcryptjs');

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'No Excel or CSV file uploaded.' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const rawRows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Uploaded file is empty or has no readable rows.' });
    }

    const defaultPasswordHash = await bcrypt.hash('password123', 10);
    let addedCount = 0;
    let skippedCount = 0;
    const errors = [];
    const addedUsers = [];

    for (let index = 0; index < rawRows.length; index++) {
      const row = rawRows[index];
      const rowNum = index + 2; // Accounting for 1-based index + header row

      const name = (row.Name || row.name || row['Employee Name'] || row.NAME || '').toString().trim();
      const email = (row.Email || row.email || row['Email Address'] || row.EMAIL || '').toString().trim().toLowerCase();
      const department = (row.Department || row.department || row.DEPARTMENT || 'General').toString().trim();
      const position = (row.Position || row.position || row.Designation || row.POSITION || 'Staff Member').toString().trim();
      let employee_code = (row.EmployeeCode || row.employee_code || row['Employee Code'] || row['Emp Code'] || row.CODE || '').toString().trim();
      const role = (row.Role || row.role || 'EMPLOYEE').toString().trim().toUpperCase() === 'HR_ADMIN' ? 'HR_ADMIN' : 'EMPLOYEE';

      if (!name || !email) {
        errors.push(`Row ${rowNum}: Missing name or email.`);
        skippedCount++;
        continue;
      }

      if (!employee_code) {
        employee_code = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      // Check duplicate
      const existingEmail = await getOne('SELECT id FROM users WHERE email = ?', [email]);
      if (existingEmail) {
        errors.push(`Row ${rowNum}: Email "${email}" already exists.`);
        skippedCount++;
        continue;
      }

      const existingCode = await getOne('SELECT id FROM users WHERE employee_code = ?', [employee_code]);
      if (existingCode) {
        employee_code = `${employee_code}-${Math.floor(10 + Math.random() * 90)}`;
      }

      // Insert User
      const result = await execute(
        `INSERT INTO users (name, email, password_hash, role, department, position, employee_code, join_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, email, defaultPasswordHash, role, department, position, employee_code, new Date().toISOString().split('T')[0]]
      );

      const userId = result.lastID;

      // Insert Default Leave Balance
      await execute(
        `INSERT INTO leave_balances (user_id, sick_leave, casual_leave, earned_leave, deducted_leave)
         VALUES (?, 12.0, 10.0, 15.0, 0.0)`,
        [userId]
      );

      addedCount++;
      addedUsers.push({ id: userId, name, email, department, position, employee_code, role });
    }

    res.json({
      success: true,
      message: `Bulk import completed: ${addedCount} employees added successfully, ${skippedCount} skipped.`,
      addedCount,
      skippedCount,
      errors,
      addedUsers
    });
  } catch (err) {
    console.error('uploadEmployeesExcel error:', err);
    res.status(500).json({ success: false, message: 'Failed to process Excel bulk upload file.' });
  }
}

async function downloadSampleExcelTemplate(req, res) {
  try {
    const xlsx = require('xlsx');

    const sampleData = [
      {
        'Name': 'Robert Taylor',
        'Email': 'robert@company.com',
        'Department': 'Engineering',
        'Position': 'DevOps Lead',
        'Employee Code': 'EMP-104',
        'Role': 'EMPLOYEE'
      },
      {
        'Name': 'Jessica Alba',
        'Email': 'jessica@company.com',
        'Department': 'Design',
        'Position': 'Senior Product Designer',
        'Employee Code': 'EMP-105',
        'Role': 'EMPLOYEE'
      }
    ];

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(sampleData);

    // Auto col width
    ws['!cols'] = [
      { wch: 20 },
      { wch: 25 },
      { wch: 18 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 }
    ];

    xlsx.utils.book_append_sheet(wb, ws, 'Sample Employees');
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="sample_employee_import.xlsx"');
    res.send(buffer);
  } catch (err) {
    console.error('downloadSampleExcelTemplate error:', err);
    res.status(500).json({ success: false, message: 'Error generating sample template.' });
  }
}

module.exports = {
  getDashboardStats,
  getAnalytics,
  getEmployees,
  getCompanySettings,
  updateCompanySettings,
  exportReport,
  uploadEmployeesExcel,
  downloadSampleExcelTemplate
};
