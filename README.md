# Employee Attendance Management System

An enterprise-grade, full-stack **Employee Attendance Management System** built with **Node.js, Express, SQLite3, React 18, Vite, and TailwindCSS**. Features interactive **HR Administration Panel**, **Employee Dashboard**, **Real-Time Check-In/Out Engine**, **Working Hours & Overtime Engine**, **Automated Leave Deduction Calculator**, **Interactive Analytics**, and **Turnkey Seed Data**.

---

## 🌟 Key Features

### 🔑 1. Authentication & Role-Based Access Control (RBAC)
- **Role Separation**: `HR_ADMIN` (Executive HR Director) and `EMPLOYEE` (Staff members).
- **Security**: Password hashing with `bcryptjs`, stateless authentication with `JWT` tokens.
- **Instant Demo Switcher**: One-click login buttons on the login screen to seamlessly switch between HR Director and Employee accounts without typing credentials.

### ⏱️ 2. Attendance Check-In / Check-Out
- **Real-Time Digital Clock**: Live clock display with shift status indicator.
- **One-Click Check-In / Check-Out**: Prevents double check-ins or orphan check-outs.
- **Shift Tracking**: Monitors 8-hour daily shifts (default 09:00 AM - 05:00 PM).

### 🧮 3. Working Hours & Overtime Calculation Engine
- **Net Worked Hours**: Calculates exact hours worked down to decimal precision (`Hours = CheckOut - CheckIn`).
- **Overtime Calculation**: Tracks hours worked beyond the standard 8-hour shift.
- **Status Classification Engine**:
  - `PRESENT`: Checked in on time within grace period (09:00 - 09:15 AM).
  - `LATE`: Checked in after 09:15 AM.
  - `HALF_DAY`: Total worked hours < 4.0 hours.
  - `ON_LEAVE`: Approved leave request active for the day.
  - `ABSENT`: Unexcused absence.

### 💸 4. Automated Leave Deduction System
- **Quota Tracking**: Tracks Casual Leave (CL), Sick Leave (SL), and Earned Leave (EL).
- **Penalty Engine**:
  - **Late Arrival Penalty**: Every 3 late check-ins automatically trigger a 0.5-day leave balance deduction.
  - **Half-Day Penalty**: Worked < 4.0 hours triggers a 0.5-day leave deduction.
  - **Absence Penalty**: Unexcused absence deducts 1.0 day.
- **Leave Request & Approval Workflow**: Employees submit leave requests -> HR Admin reviews, approves, or rejects with feedback comments -> Auto-deducts approved leave quotas.

### 📊 5. HR Administration Panel
- **Executive Metrics Counters**: Total Workforce, Present Today, Late Arrivals Today, On Leave Today, Pending Requests.
- **Visual Analytics**: Interactive Recharts graphs showing 14-day attendance trends and department workforce distributions.
- **Master Attendance Log**: Search by employee name/code, filter by date or status, and apply HR manual entry overrides.
- **Employee Directory**: Manage staff accounts, job titles, and leave quotas.
- **Shift & Policy Configurator**: Customise work start time, work end time, grace period, and late penalty multipliers.
- **CSV Data Exporter**: Single-click export of complete attendance and leave logs into standard `.csv` files.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js REST API
- **Database**: SQLite3 (`better-sqlite3` / `sqlite3`) with schema migrations & seed script
- **Frontend**: React 18, Vite, TailwindCSS, Lucide Icons, Recharts
- **Authentication**: JSON Web Tokens (JWT), Bcrypt password encryption

---

## 🚀 Quick Setup & Setup Instructions

### 1️⃣ Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher

### 2️⃣ Running Backend Server
```bash
cd backend
npm install
npm run seed      # Populates DB with 30+ days of attendance history & demo accounts
npm start         # Starts backend API server on http://localhost:5000
```

### 3️⃣ Running Frontend Application
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev       # Starts React dev server on http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser.

---

## 🔑 Pre-Configured Turnkey Demo Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **HR Director** | `admin@company.com` | `password123` | Full HR Admin Panel access, shift configuration, leave approvals |
| **Employee (Senior Dev)** | `john@company.com` | `password123` | Check-in/out, personal attendance logs, leave balances |
| **Employee (UI Lead)** | `emily@company.com` | `password123` | Check-in/out, leave application test |
| **Employee (Growth Lead)** | `mike@company.com` | `password123` | Check-in/out, leave application test |

---

## 🗄️ Database Architecture Schema

```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'EMPLOYEE', -- 'HR_ADMIN' or 'EMPLOYEE'
  department TEXT,
  position TEXT,
  employee_code TEXT UNIQUE,
  join_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  check_in TEXT,
  check_out TEXT,
  working_hours REAL DEFAULT 0.0,
  overtime_hours REAL DEFAULT 0.0,
  status TEXT NOT NULL DEFAULT 'PRESENT', -- 'PRESENT', 'LATE', 'HALF_DAY', 'ABSENT', 'ON_LEAVE'
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, date)
);

-- Leave Balances table
CREATE TABLE leave_balances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  sick_leave REAL DEFAULT 12.0,
  casual_leave REAL DEFAULT 10.0,
  earned_leave REAL DEFAULT 15.0,
  deducted_leave REAL DEFAULT 0.0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Leave Requests table
CREATE TABLE leave_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  leave_type TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  total_days REAL NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
  hr_comments TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔌 API Endpoint Reference

### Auth Endpoints
- `POST /api/auth/login` - Authenticate user & return JWT token.
- `POST /api/auth/register` - Create new user profile.
- `GET /api/auth/me` - Fetch authenticated user profile & leave balances.

### Attendance Endpoints
- `POST /api/attendance/check-in` - Record check-in timestamp.
- `POST /api/attendance/check-out` - Record check-out timestamp & calculate worked hours.
- `GET /api/attendance/today` - Get today's check-in/out status.
- `GET /api/attendance/my-history` - Get user's attendance history & deduction summary.

### Leave Endpoints
- `POST /api/leaves/apply` - Submit new leave application.
- `GET /api/leaves/my-leaves` - Get user's leave requests & remaining balance.

### HR Admin Endpoints (HR_ADMIN only)
- `GET /api/hr/stats` - Company executive overview counters.
- `GET /api/hr/analytics` - Attendance trend and department chart data.
- `GET /api/hr/employees` - List all employee profiles & leave balances.
- `GET /api/hr/attendance` - Query all attendance logs with search, status, and date filters.
- `POST /api/hr/attendance/manual` - Manual attendance record override.
- `GET /api/hr/leaves` - View pending/all leave requests.
- `PATCH /api/hr/leaves/:id/respond` - Approve or reject leave request.
- `GET /api/hr/settings` - Get company shift policy settings.
- `POST /api/hr/settings` - Update shift hours & penalty rules.
- `GET /api/hr/export-csv` - Download attendance logs CSV file.
