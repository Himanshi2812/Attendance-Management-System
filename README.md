# Employee Attendance Management System

A full-stack Employee Attendance Management System built using the MERN stack (MongoDB, Express.js, React 18, Node.js) and Tailwind CSS. The application includes role-based authentication, real-time check-in and check-out tracking, working hours calculation, an automated leave deduction engine, an HR administration portal, and employee dashboard metrics.

---

## Features Summary

- **Employee Authentication & Registration**: Role-Based Access Control (`EMPLOYEE` and `HR_ADMIN`) using JWT and bcrypt password hashing.
- **Attendance Check-In / Check-Out**: Real-time ISO UTC timestamp tracking with guard rails against duplicate daily check-ins.
- **Working Hours & Overtime Calculation**: Computes exact duration (`checkOut - checkIn`) in decimal hours.
- **Leave & Status Deduction Engine**: Automated policy status assignment (`PRESENT`, `LATE`, `HALF_DAY`, `ABSENT`, `ON_LEAVE`) and deduction hierarchy (`Casual Leave` -> `Sick Leave` -> `Unpaid Leave`).
- **HR Dashboard**: Organization-wide metrics, filterable master log, CSV report export, manual entry override, and shift policy settings.
- **Employee Dashboard**: Active work timer, personal monthly attendance history timeline, leave quota counters, and leave application modal.

---

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js REST API, JSON Web Tokens (JWT), bcryptjs
- **Database**: MongoDB / Mongoose ODM (with embedded driver for zero-config execution)

---

## Local Setup Instructions

### Prerequisites
- Node.js (v18.0 or higher)
- npm (v9.0 or higher)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize database and seed demo data:
   ```bash
   npm run seed
   ```
4. Start the backend API server:
   ```bash
   npm start
   ```
   The backend server will run on `http://localhost:5000`.

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend application will run on `http://localhost:5173`.

---

## Demo Accounts

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **HR Director** | `admin@company.com` | `password123` | HR Dashboard, Analytics, Leave Approvals, Shift Policy, CSV Export |
| **Employee (Senior Dev)** | `john@company.com` | `password123` | Check-in/out, Attendance Logs, Leave Balances, Apply Leave |
| **Employee (UI Lead)** | `emily@company.com` | `password123` | Check-in/out, Attendance Logs, Apply Leave |

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login and JWT issue.
- `POST /api/auth/register` - Create new user profile.
- `GET /api/auth/me` - Get profile and leave balance details.

### Attendance
- `POST /api/attendance/check-in` - Record check-in timestamp.
- `POST /api/attendance/check-out` - Record check-out timestamp and calculate worked hours.
- `GET /api/attendance/today` - Today's check-in/out status.
- `GET /api/attendance/my-history` - Personal monthly attendance history.

### Leaves
- `POST /api/leaves/apply` - Submit leave request.
- `GET /api/leaves/my-leaves` - Get user leave requests and balances.

### HR Management (`HR_ADMIN` only)
- `GET /api/hr/stats` - Organization overview counters.
- `GET /api/hr/analytics` - Attendance trend and department distribution data.
- `GET /api/hr/employees` - All employee profiles and leave quotas.
- `GET /api/hr/attendance` - Master attendance log with search and status filters.
- `POST /api/hr/attendance/manual` - Manual attendance record override.
- `GET /api/hr/leaves` - View pending/all leave requests.
- `PATCH /api/hr/leaves/:id/respond` - Approve or reject leave request.
- `GET /api/hr/export-csv` - Export attendance records as CSV.
