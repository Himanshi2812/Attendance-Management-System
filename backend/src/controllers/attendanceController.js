const { getOne, query, execute } = require('../database/db');
const { calculateHoursDifference, determineAttendanceStatus, applyDebitHierarchy } = require('../services/attendanceService');

async function checkIn(req, res) {
  try {
    const userId = req.user.id;
    const { notes } = req.body;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const checkInISO = now.toISOString();

    // Guard rails: Check if already checked in today
    const existing = await getOne('SELECT * FROM attendance WHERE user_id = ? AND date = ?', [userId, dateStr]);
    if (existing && existing.check_in) {
      return res.status(400).json({ success: false, message: 'You have already checked in for today.' });
    }

    if (existing) {
      await execute(
        `UPDATE attendance SET check_in = ?, status = 'PRESENT', notes = ? WHERE id = ?`,
        [checkInISO, notes || existing.notes, existing.id]
      );
    } else {
      await execute(
        `INSERT INTO attendance (user_id, date, check_in, status, notes) VALUES (?, ?, ?, 'PRESENT', ?)`,
        [userId, dateStr, checkInISO, notes || 'Web Single Sign-On Clock-In']
      );
    }

    const updated = await getOne('SELECT * FROM attendance WHERE user_id = ? AND date = ?', [userId, dateStr]);

    res.json({
      success: true,
      message: 'Checked in successfully.',
      attendance: updated
    });
  } catch (err) {
    console.error('CheckIn error:', err);
    res.status(500).json({ success: false, message: 'Error processing check-in' });
  }
}

async function checkOut(req, res) {
  try {
    const userId = req.user.id;
    const { notes } = req.body;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const checkOutISO = now.toISOString();

    const existing = await getOne('SELECT * FROM attendance WHERE user_id = ? AND date = ?', [userId, dateStr]);

    if (!existing || !existing.check_in) {
      return res.status(400).json({ success: false, message: 'No check-in record found for today. Please check in first.' });
    }

    if (existing.check_out) {
      return res.status(400).json({ success: false, message: 'You have already checked out today.' });
    }

    // 1. Calculate net worked hours
    const workingHours = calculateHoursDifference(existing.check_in, checkOutISO);
    const overtimeHours = workingHours > 8.0 ? parseFloat((workingHours - 8.0).toFixed(2)) : 0.0;

    // 2. Determine Attendance Status & Deduction Amount according to rules:
    // >= 8 hrs -> PRESENT (0 deduction)
    // 4 to <8 hrs -> HALF_DAY (0.5 deduction)
    // < 4 hrs -> ABSENT (1.0 deduction)
    const { status, deduction } = determineAttendanceStatus(workingHours);

    await execute(
      `UPDATE attendance SET check_out = ?, working_hours = ?, overtime_hours = ?, status = ?, notes = ? WHERE id = ?`,
      [checkOutISO, workingHours, overtimeHours, status, notes || existing.notes, existing.id]
    );

    // 3. Apply Debit Hierarchy (Casual -> Sick -> Unpaid Loss of Pay)
    if (deduction > 0) {
      await applyDebitHierarchy(userId, deduction);
    }

    const updated = await getOne('SELECT * FROM attendance WHERE user_id = ? AND date = ?', [userId, dateStr]);
    const balance = await getOne('SELECT * FROM leave_balances WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      message: `Checked out successfully. Duration: ${workingHours} hrs (${status}).`,
      attendance: updated,
      leaveBalance: balance
    });
  } catch (err) {
    console.error('CheckOut error:', err);
    res.status(500).json({ success: false, message: 'Error processing check-out' });
  }
}

async function getTodayStatus(req, res) {
  try {
    const userId = req.user.id;
    const dateStr = new Date().toISOString().split('T')[0];

    const todayRecord = await getOne('SELECT * FROM attendance WHERE user_id = ? AND date = ?', [userId, dateStr]);
    const shift = await getOne('SELECT * FROM shifts LIMIT 1');

    res.json({
      success: true,
      today: todayRecord || null,
      shift: shift || { start_time: '09:00', end_time: '17:00', grace_period_mins: 15 }
    });
  } catch (err) {
    console.error('getTodayStatus error:', err);
    res.status(500).json({ success: false, message: 'Error loading today status' });
  }
}

async function getMyHistory(req, res) {
  try {
    const userId = req.user.id;
    const records = await query('SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 60', [userId]);
    const balance = await getOne('SELECT * FROM leave_balances WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      records,
      balance: balance || { casual_leave: 10, sick_leave: 12, earned_leave: 15, unpaid_leave: 0, deducted_leave: 0 }
    });
  } catch (err) {
    console.error('getMyHistory error:', err);
    res.status(500).json({ success: false, message: 'Error fetching history' });
  }
}

async function getAllAttendanceHR(req, res) {
  try {
    const { date, search, department, status } = req.query;

    let sql = `
      SELECT a.*, u.name as employee_name, u.email as employee_email, u.department, u.position, u.employee_code
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      sql += ' AND a.date = ?';
      params.push(date);
    }
    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }
    if (department) {
      sql += ' AND u.department = ?';
      params.push(department);
    }
    if (search) {
      sql += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.employee_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY a.date DESC LIMIT 200';

    const records = await query(sql, params);

    res.json({
      success: true,
      records
    });
  } catch (err) {
    console.error('getAllAttendanceHR error:', err);
    res.status(500).json({ success: false, message: 'Error loading attendance logs' });
  }
}

async function manualEntryHR(req, res) {
  try {
    const { user_id, date, check_in, check_out, status, notes } = req.body;

    if (!user_id || !date) {
      return res.status(400).json({ success: false, message: 'User ID and Date are required' });
    }

    let workingHours = 0.0;
    let overtimeHours = 0.0;
    if (check_in && check_out) {
      workingHours = calculateHoursDifference(check_in, check_out);
      overtimeHours = workingHours > 8.0 ? parseFloat((workingHours - 8.0).toFixed(2)) : 0.0;
    }

    const { deduction } = determineAttendanceStatus(workingHours);
    const finalStatus = status || (workingHours >= 8.0 ? 'PRESENT' : workingHours >= 4.0 ? 'HALF_DAY' : 'ABSENT');

    const existing = await getOne('SELECT id FROM attendance WHERE user_id = ? AND date = ?', [user_id, date]);

    if (existing) {
      await execute(
        `UPDATE attendance SET check_in = ?, check_out = ?, working_hours = ?, overtime_hours = ?, status = ?, notes = ? WHERE id = ?`,
        [check_in, check_out, workingHours, overtimeHours, finalStatus, notes || 'HR Manual Regularization', existing.id]
      );
    } else {
      await execute(
        `INSERT INTO attendance (user_id, date, check_in, check_out, working_hours, overtime_hours, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, date, check_in, check_out, workingHours, overtimeHours, finalStatus, notes || 'HR Manual Regularization']
      );
    }

    if (deduction > 0) {
      await applyDebitHierarchy(user_id, deduction);
    }

    res.json({
      success: true,
      message: 'Attendance record manually regularized by HR'
    });
  } catch (err) {
    console.error('manualEntryHR error:', err);
    res.status(500).json({ success: false, message: 'Error saving manual entry' });
  }
}

module.exports = {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyHistory,
  getAllAttendanceHR,
  manualEntryHR
};
