const { getOne, query, execute } = require('../database/db');

/**
 * Calculates net worked hours between two ISO UTC strings or time values
 */
function calculateHoursDifference(checkInISO, checkOutISO) {
  if (!checkInISO || !checkOutISO) return 0.0;
  
  const inTime = new Date(checkInISO).getTime();
  const outTime = new Date(checkOutISO).getTime();

  if (isNaN(inTime) || isNaN(outTime) || outTime <= inTime) return 0.0;

  const diffMs = outTime - inTime;
  return parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
}

/**
 * Determines Attendance Status & Deduction Amount based on Worked Hours
 * >= 8.0 hrs -> PRESENT (0.0 deduction)
 * 4.0 to < 8.0 hrs -> HALF_DAY (0.5 deduction)
 * < 4.0 hrs -> ABSENT (1.0 deduction)
 */
function determineAttendanceStatus(workingHours) {
  if (workingHours >= 8.0) {
    return { status: 'PRESENT', deduction: 0.0 };
  } else if (workingHours >= 4.0) {
    return { status: 'HALF_DAY', deduction: 0.5 };
  } else {
    return { status: 'ABSENT', deduction: 1.0 };
  }
}

/**
 * Debit Hierarchy for Leave Deductions:
 * Casual Leave -> Sick Leave -> Unpaid Leave (Loss of Pay)
 */
async function applyDebitHierarchy(userId, deductionAmount) {
  if (deductionAmount <= 0) return;

  const balance = await getOne('SELECT * FROM leave_balances WHERE user_id = ?', [userId]);
  if (!balance) return;

  let remainingDeduction = deductionAmount;
  let casual = balance.casual_leave || 0;
  let sick = balance.sick_leave || 0;
  let unpaid = balance.unpaid_leave || 0;

  // 1. Debit Casual Leave
  if (casual > 0 && remainingDeduction > 0) {
    const debit = Math.min(casual, remainingDeduction);
    casual -= debit;
    remainingDeduction -= debit;
  }

  // 2. Debit Sick Leave
  if (sick > 0 && remainingDeduction > 0) {
    const debit = Math.min(sick, remainingDeduction);
    sick -= debit;
    remainingDeduction -= debit;
  }

  // 3. Increment Unpaid Leave (Loss of Pay) if quota exhausted
  if (remainingDeduction > 0) {
    unpaid += remainingDeduction;
    remainingDeduction = 0;
  }

  await execute(
    `UPDATE leave_balances SET casual_leave = ?, sick_leave = ?, unpaid_leave = ?, deducted_leave = deducted_leave + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
    [parseFloat(casual.toFixed(1)), parseFloat(sick.toFixed(1)), parseFloat(unpaid.toFixed(1)), deductionAmount, userId]
  );
}

module.exports = {
  calculateHoursDifference,
  determineAttendanceStatus,
  applyDebitHierarchy
};
