const { getOne, query, execute } = require('../database/db');

async function applyLeave(req, res) {
  try {
    const userId = req.user.id;
    const { leave_type, start_date, end_date, total_days, reason } = req.body;

    if (!leave_type || !start_date || !end_date || !total_days) {
      return res.status(400).json({ success: false, message: 'All leave fields are required' });
    }

    // Insert leave request
    const result = await execute(
      `INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, total_days, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
      [userId, leave_type, start_date, end_date, parseFloat(total_days), reason || '']
    );

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully for HR approval',
      requestId: result.id
    });
  } catch (err) {
    console.error('applyLeave error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit leave request' });
  }
}

async function getMyLeaves(req, res) {
  try {
    const userId = req.user.id;

    const requests = await query(
      `SELECT * FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    const balance = await getOne(
      `SELECT sick_leave, casual_leave, earned_leave, deducted_leave FROM leave_balances WHERE user_id = ?`,
      [userId]
    );

    res.json({
      success: true,
      requests,
      balance: balance || { sick_leave: 12, casual_leave: 10, earned_leave: 15, deducted_leave: 0 }
    });
  } catch (err) {
    console.error('getMyLeaves error:', err);
    res.status(500).json({ success: false, message: 'Error retrieving leave records' });
  }
}

async function getAllLeaveRequestsHR(req, res) {
  try {
    const { status } = req.query;

    let sql = `
      SELECT lr.*, u.name as employee_name, u.email as employee_email, u.department, u.position
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND lr.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY lr.created_at DESC';

    const requests = await query(sql, params);

    res.json({
      success: true,
      requests
    });
  } catch (err) {
    console.error('getAllLeaveRequestsHR error:', err);
    res.status(500).json({ success: false, message: 'Error loading leave requests' });
  }
}

async function respondToLeaveHR(req, res) {
  try {
    const { id } = req.params;
    const { status, hr_comments } = req.body; // status: 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be APPROVED or REJECTED' });
    }

    const leaveReq = await getOne('SELECT * FROM leave_requests WHERE id = ?', [id]);
    if (!leaveReq) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    await execute(
      `UPDATE leave_requests SET status = ?, hr_comments = ? WHERE id = ?`,
      [status, hr_comments || '', id]
    );

    // If APPROVED, deduct leave balance and set attendance records to ON_LEAVE
    if (status === 'APPROVED') {
      const fieldMap = {
        'SICK': 'sick_leave',
        'CASUAL': 'casual_leave',
        'EARNED': 'earned_leave'
      };
      const colName = fieldMap[leaveReq.leave_type];

      if (colName) {
        await execute(
          `UPDATE leave_balances SET ${colName} = MAX(0, ${colName} - ?) WHERE user_id = ?`,
          [leaveReq.total_days, leaveReq.user_id]
        );
      }

      // Mark attendance records for the date range as ON_LEAVE
      const start = new Date(leaveReq.start_date);
      const end = new Date(leaveReq.end_date);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dStr = d.toISOString().split('T')[0];
        const existingAtt = await getOne('SELECT id FROM attendance WHERE user_id = ? AND date = ?', [leaveReq.user_id, dStr]);
        
        if (existingAtt) {
          await execute(
            `UPDATE attendance SET status = 'ON_LEAVE', notes = 'Approved Leave' WHERE id = ?`,
            [existingAtt.id]
          );
        } else {
          await execute(
            `INSERT INTO attendance (user_id, date, status, notes) VALUES (?, ?, 'ON_LEAVE', 'Approved Leave')`,
            [leaveReq.user_id, dStr]
          );
        }
      }
    }

    res.json({
      success: true,
      message: `Leave request successfully ${status.toLowerCase()}`
    });
  } catch (err) {
    console.error('respondToLeaveHR error:', err);
    res.status(500).json({ success: false, message: 'Error processing leave request decision' });
  }
}

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaveRequestsHR,
  respondToLeaveHR
};
