# Employee Attendance Management System (MERN Stack Architecture)

An enterprise-grade, full-stack **Employee Attendance Management System** developed with the **MERN Stack** (**MongoDB / Mongoose, Express.js, React 18, Node.js**) & **TailwindCSS**. Features an interactive **HR Administration Panel**, **Employee Dashboard**, **Real-Time Check-In/Out Engine**, **Working Hours & Overtime Engine**, **Automated Leave Deduction Calculator**, **Interactive Analytics**, and **Turnkey Seed Data**.

---

## 📋 Features Checklist (Assignment Compliance)

| Feature | Status | Description |
| :--- | :--- | :--- |
| **🔑 Employee Login & Registration** | ✅ Complete | Role-Based Access Control (`EMPLOYEE` vs `HR_ADMIN`), JWT Stateless Auth, Bcrypt Encryption |
| **⏱️ Attendance Check-In / Check-Out** | ✅ Complete | Real-time ISO UTC timestamps, same-day duplicate check-in guard rails, active work timer |
| **🧮 Working Hours Calculation** | ✅ Complete | Calculates exact duration (`CheckOut - CheckIn`) down to decimal hours |
| **💸 Leave Deduction Engine** | ✅ Complete | Automatic penalty debit hierarchy: `Casual Leave` → `Sick Leave` → `Unpaid Leave` |
| **📊 HR Dashboard** | ✅ Complete | Workforce metrics, filterable master log, CSV report export, manual entry override, shift policy config |
| **📱 Employee Dashboard** | ✅ Complete | One-click clock terminal, personal attendance history timeline, leave quota counters, leave application modal |
| **📍 Attendance Status Tracking** | ✅ Complete | Classifies shifts into `PRESENT` (≥8h), `LATE`, `HALF_DAY` (<8h, 0.5d penalty), `ABSENT` (<4h, 1.0d penalty), `ON_LEAVE` |

---

## 🛠️ Technology Stack (MERN Architecture)

- **M** - **MongoDB / Mongoose ODM** (and zero-config embedded database engine for instant execution)
- **E** - **Express.js REST API** (Modular controllers, JWT auth middleware, role guards)
- **R** - **React 18 & Vite** (TailwindCSS, Recharts, Lucide Icons, Context API state management)
- **N** - **Node.js Runtime**

---

## 🚀 Quick Setup Instructions

### 1️⃣ Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher

### 2️⃣ Running Backend REST Server
```bash
cd backend
npm install
npm run seed      # Initializes database schema & populates demo accounts
npm start         # Starts backend Express API server on http://localhost:5000
```

### 3️⃣ Running Frontend Application
Open a second terminal window:
```bash
cd frontend
npm install
npm run dev       # Starts React dev server on http://localhost:5173
```

Navigate to **`http://localhost:5173`** in your browser.

---

## 🔑 Turnkey Demo Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **HR Director** | `admin@company.com` | `password123` | HR Dashboard, Analytics, Leave Approvals, Policy Settings, CSV Export |
| **Employee (Senior Dev)** | `john@company.com` | `password123` | Clock In/Out, Personal Attendance Logs, Leave Balances, Apply Leave |
| **Employee (UI Lead)** | `emily@company.com` | `password123` | Clock In/Out, Personal Attendance Logs, Leave Requests |

*(Single-click **Switch Account** button is available in the top bar for instant testing without typing credentials)*

---

## 🗄️ Database Architecture Models (Mongoose & SQL Schemas)

### MongoDB Mongoose Models (`backend/src/models/`)
- `User.js` - `{ name, email, password_hash, role, department, position, employee_code, join_date }`
- `Attendance.js` - `{ user_id, date, check_in, check_out, working_hours, overtime_hours, status, notes }`
- `LeaveBalance.js` - `{ user_id, sick_leave, casual_leave, earned_leave, deducted_leave }`
- `LeaveRequest.js` - `{ user_id, leave_type, start_date, end_date, total_days, reason, status, hr_comments }`
- `CompanySettings.js` - `{ work_start_time, work_end_time, grace_period_mins, late_count_deduction_threshold }`

---

## 🔌 API Reference Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate user & return JWT token.
- `POST /api/auth/register` - Register new user profile.
- `GET /api/auth/me` - Get profile & leave quota details.

### Attendance Engine
- `POST /api/attendance/check-in` - Record check-in timestamp.
- `POST /api/attendance/check-out` - Record check-out timestamp & calculate worked hours.
- `GET /api/attendance/today` - Today's check-in/out status.
- `GET /api/attendance/my-history` - Personal monthly attendance history.

### Leave Engine
- `POST /api/leaves/apply` - Submit new leave application.
- `GET /api/leaves/my-leaves` - User leave requests & balances.

### HR Management (`HR_ADMIN` role required)
- `GET /api/hr/stats` - Company workforce metrics counters.
- `GET /api/hr/analytics` - Attendance trend and department distribution chart data.
- `GET /api/hr/employees` - All staff profiles & leave balances.
- `GET /api/hr/attendance` - Query all attendance logs with search, status, and date filters.
- `POST /api/hr/attendance/manual` - Manual attendance record override.
- `GET /api/hr/leaves` - View pending/all leave requests.
- `PATCH /api/hr/leaves/:id/respond` - Approve or reject leave request.
- `GET /api/hr/export-csv` - Download attendance logs CSV file.
