const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const attendanceController = require('../controllers/attendanceController');
const leaveController = require('../controllers/leaveController');
const hrController = require('../controllers/hrController');

const { verifyToken, isHRAdmin } = require('../middleware/authMiddleware');

// --- Auth Routes ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', verifyToken, authController.getProfile);

// --- Employee Attendance Routes ---
router.post('/attendance/check-in', verifyToken, attendanceController.checkIn);
router.post('/attendance/check-out', verifyToken, attendanceController.checkOut);
router.get('/attendance/today', verifyToken, attendanceController.getTodayStatus);
router.get('/attendance/my-history', verifyToken, attendanceController.getMyHistory);

// --- Employee Leave Routes ---
router.post('/leaves/apply', verifyToken, leaveController.applyLeave);
router.get('/leaves/my-leaves', verifyToken, leaveController.getMyLeaves);

// --- HR Admin Routes ---
router.get('/hr/stats', verifyToken, isHRAdmin, hrController.getDashboardStats);
router.get('/hr/analytics', verifyToken, isHRAdmin, hrController.getAnalytics);
router.get('/hr/employees', verifyToken, isHRAdmin, hrController.getEmployees);
router.get('/hr/attendance', verifyToken, isHRAdmin, attendanceController.getAllAttendanceHR);
router.post('/hr/attendance/manual', verifyToken, isHRAdmin, attendanceController.manualEntryHR);
router.get('/hr/leaves', verifyToken, isHRAdmin, leaveController.getAllLeaveRequestsHR);
router.patch('/hr/leaves/:id/respond', verifyToken, isHRAdmin, leaveController.respondToLeaveHR);
router.get('/hr/settings', verifyToken, isHRAdmin, hrController.getCompanySettings);
router.post('/hr/settings', verifyToken, isHRAdmin, hrController.updateCompanySettings);
router.get('/hr/export-csv', verifyToken, isHRAdmin, hrController.exportReport);

module.exports = router;
