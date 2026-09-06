const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_employee_attendance_key_2026';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token missing or invalid' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
}

function isHRAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'HR_ADMIN') {
    return res.status(403).json({ success: false, message: 'Access denied. HR Admin privileges required.' });
  }
  next();
}

module.exports = {
  verifyToken,
  isHRAdmin,
  JWT_SECRET
};
