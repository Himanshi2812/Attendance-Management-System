const { execute } = require('./db');

async function initSchema() {
  console.log('⚡ Initializing Enterprise Database Schema...');

  // Users table
  await execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'EMPLOYEE', -- 'HR_ADMIN' or 'EMPLOYEE'
      department TEXT DEFAULT 'Engineering',
      position TEXT DEFAULT 'Software Engineer',
      employee_code TEXT UNIQUE,
      join_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Shifts table
  await execute(`
    CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_time TEXT NOT NULL DEFAULT '09:00',
      end_time TEXT NOT NULL DEFAULT '17:00',
      grace_period_mins INTEGER DEFAULT 15,
      half_day_hours REAL DEFAULT 4.0,
      full_day_hours REAL DEFAULT 8.0
    )
  `);

  // Attendance records table
  await execute(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL, -- YYYY-MM-DD
      check_in TEXT,      -- ISO UTC string
      check_out TEXT,     -- ISO UTC string
      working_hours REAL DEFAULT 0.0,
      overtime_hours REAL DEFAULT 0.0,
      status TEXT NOT NULL DEFAULT 'PRESENT', -- 'PRESENT', 'LATE', 'HALF_DAY', 'ABSENT', 'ON_LEAVE'
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    )
  `);

  // Leave balances table
  await execute(`
    CREATE TABLE IF NOT EXISTS leave_balances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      casual_leave REAL DEFAULT 10.0,
      sick_leave REAL DEFAULT 12.0,
      earned_leave REAL DEFAULT 15.0,
      unpaid_leave REAL DEFAULT 0.0,
      deducted_leave REAL DEFAULT 0.0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Leave requests table
  await execute(`
    CREATE TABLE IF NOT EXISTS leave_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      leave_type TEXT NOT NULL, -- 'CASUAL', 'SICK', 'EARNED', 'UNPAID'
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      total_days REAL NOT NULL,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
      hr_comments TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Company settings table
  await execute(`
    CREATE TABLE IF NOT EXISTS company_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT
    )
  `);

  console.log(' Database Schema Initialized Successfully!');
}

module.exports = { initSchema };
