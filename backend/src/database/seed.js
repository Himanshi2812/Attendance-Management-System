const bcrypt = require('bcryptjs');
const { initSchema } = require('./init');
const { getOne, execute, query } = require('./db');

async function seed() {
  await initSchema();
  console.log('🌱 Starting Indian Employee Profiles Database Seeding...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Clear existing attendance and leaves for a clean reset
  await execute('DELETE FROM attendance');
  await execute('DELETE FROM leave_requests');
  await execute('DELETE FROM leave_balances');
  await execute('DELETE FROM users');

  // 1. Shift
  await execute(
    `INSERT OR REPLACE INTO shifts (id, name, start_time, end_time, grace_period_mins, half_day_hours, full_day_hours)
     VALUES (1, 'Standard Corporate Shift', '09:00', '17:00', 15, 4.0, 8.0)`
  );

  // 2. Settings
  const settings = [
    { key: 'work_start_time', value: '09:00', description: 'Standard shift start time' },
    { key: 'work_end_time', value: '17:00', description: 'Standard shift end time' },
    { key: 'grace_period_mins', value: '15', description: 'Grace period allowed for late check-in in minutes' },
    { key: 'late_count_deduction_threshold', value: '3', description: 'Number of late check-ins that trigger 0.5 day leave deduction' },
  ];

  for (const s of settings) {
    await execute(
      `INSERT OR REPLACE INTO company_settings (key, value, description) VALUES (?, ?, ?)`,
      [s.key, s.value, s.description]
    );
  }

  // 3. Realistic Indian Employee Profiles
  const usersToSeed = [
    {
      name: 'Himanshi Kalra',
      email: 'admin@company.com',
      password_hash: passwordHash,
      role: 'HR_ADMIN',
      department: 'Human Resources',
      position: 'HR Director',
      employee_code: 'EMP-1001',
      join_date: '2022-01-15'
    },
    {
      name: 'Sakshi Kumari',
      email: 'john@company.com',
      password_hash: passwordHash,
      role: 'EMPLOYEE',
      department: 'Software Engineering',
      position: 'Senior Cloud Architect',
      employee_code: 'EMP-1084',
      join_date: '2023-03-01'
    },
    {
      name: 'Ishita Mukherjee',
      email: 'emily@company.com',
      password_hash: passwordHash,
      role: 'EMPLOYEE',
      department: 'Product Design',
      position: 'Lead UX Architect',
      employee_code: 'EMP-1092',
      join_date: '2023-06-10'
    },
    {
      name: 'Anurag Kumar',
      email: 'anurag@company.com',
      password_hash: passwordHash,
      role: 'EMPLOYEE',
      department: 'Backend Engineering',
      position: 'Senior Systems Engineer',
      employee_code: 'EMP-1093',
      join_date: '2023-08-15'
    },
    {
      name: 'Swakshi Singh',
      email: 'swakshi@company.com',
      password_hash: passwordHash,
      role: 'EMPLOYEE',
      department: 'Web Development',
      position: 'Full Stack Engineer',
      employee_code: 'EMP-1094',
      join_date: '2023-11-01'
    },
    {
      name: 'Subham Nayek',
      email: 'subham@company.com',
      password_hash: passwordHash,
      role: 'EMPLOYEE',
      department: 'Quality Assurance',
      position: 'QA Automation Lead',
      employee_code: 'EMP-1095',
      join_date: '2024-01-10'
    }
  ];

  for (const u of usersToSeed) {
    const res = await execute(
      `INSERT INTO users (name, email, password_hash, role, department, position, employee_code, join_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.name, u.email, u.password_hash, u.role, u.department, u.position, u.employee_code, u.join_date]
    );

    await execute(
      `INSERT INTO leave_balances (user_id, sick_leave, casual_leave, earned_leave, deducted_leave)
       VALUES (?, 12.0, 10.0, 15.0, 0.0)`,
      [res.id]
    );
  }

  // 4. Sample Clean Attendance Logs
  const sakshi = await getOne("SELECT id FROM users WHERE email = 'john@company.com'");
  const ishita = await getOne("SELECT id FROM users WHERE email = 'emily@company.com'");
  const anurag = await getOne("SELECT id FROM users WHERE email = 'anurag@company.com'");

  const sampleLogs = [
    {
      user_id: sakshi.id,
      date: '2026-09-04',
      check_in: '08:55:00',
      check_out: '17:05:00',
      working_hours: 8.16,
      overtime_hours: 0.16,
      status: 'PRESENT',
      notes: 'Single Sign-On Authentication'
    },
    {
      user_id: sakshi.id,
      date: '2026-09-05',
      check_in: '09:20:00',
      check_out: '17:30:00',
      working_hours: 8.16,
      overtime_hours: 0.16,
      status: 'LATE',
      notes: 'Transit delay log'
    },
    {
      user_id: sakshi.id,
      date: '2026-09-06',
      check_in: '08:52:00',
      check_out: '17:00:00',
      working_hours: 8.13,
      overtime_hours: 0.13,
      status: 'PRESENT',
      notes: 'Web Portal Check-in'
    },
    {
      user_id: ishita.id,
      date: '2026-09-05',
      check_in: '08:50:00',
      check_out: '17:10:00',
      working_hours: 8.33,
      overtime_hours: 0.33,
      status: 'PRESENT',
      notes: 'Biometric Terminal'
    },
    {
      user_id: ishita.id,
      date: '2026-09-06',
      check_in: '08:58:00',
      check_out: '17:02:00',
      working_hours: 8.06,
      overtime_hours: 0.06,
      status: 'PRESENT',
      notes: 'Web Portal Check-in'
    },
    {
      user_id: anurag.id,
      date: '2026-09-06',
      check_in: '09:00:00',
      check_out: '17:00:00',
      working_hours: 8.00,
      overtime_hours: 0.00,
      status: 'PRESENT',
      notes: 'VPN Check-in'
    }
  ];

  for (const log of sampleLogs) {
    await execute(
      `INSERT INTO attendance (user_id, date, check_in, check_out, working_hours, overtime_hours, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [log.user_id, log.date, log.check_in, log.check_out, log.working_hours, log.overtime_hours, log.status, log.notes]
    );
  }

  // 5. Sample Leave Requests
  await execute(
    `INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, total_days, reason, status, hr_comments)
     VALUES (?, 'CASUAL', '2026-09-14', '2026-09-15', 2.0, 'Attending Family Function', 'PENDING', NULL)`,
    [sakshi.id]
  );

  await execute(
    `INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, total_days, reason, status, hr_comments)
     VALUES (?, 'SICK', '2026-09-01', '2026-09-01', 1.0, 'Outpatient medical appointment', 'APPROVED', 'Approved by Himanshi Kalra (HR)')`,
    [ishita.id]
  );

  console.log('✅ Indian Employee Database Seeding Completed Successfully!');
}

seed().catch((err) => {
  console.error('❌ Seeding Failed:', err);
});
