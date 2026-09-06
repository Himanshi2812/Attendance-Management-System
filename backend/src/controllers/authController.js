const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getOne, execute } = require('../database/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

async function register(req, res) {
  try {
    const { name, email, password, role, department, position, employee_code } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await getOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userRole = role === 'HR_ADMIN' ? 'HR_ADMIN' : 'EMPLOYEE';
    const empCode = employee_code || `EMP-${Math.floor(100 + Math.random() * 900)}`;
    const joinDate = new Date().toISOString().split('T')[0];

    const result = await execute(
      `INSERT INTO users (name, email, password_hash, role, department, position, employee_code, join_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, password_hash, userRole, department || 'General', position || 'Staff Member', empCode, joinDate]
    );

    // Create default leave balance
    await execute(
      `INSERT INTO leave_balances (user_id, sick_leave, casual_leave, earned_leave, deducted_leave)
       VALUES (?, 12.0, 10.0, 15.0, 0.0)`,
      [result.id]
    );

    const token = jwt.sign(
      { id: result.id, email, role: userRole, name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: result.id,
        name,
        email,
        role: userRole,
        department: department || 'General',
        position: position || 'Staff Member',
        employee_code: empCode
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during registration' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await getOne('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
        employee_code: user.employee_code,
        join_date: user.join_date
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during login' });
  }
}

async function getProfile(req, res) {
  try {
    const user = await getOne('SELECT id, name, email, role, department, position, employee_code, join_date FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const leaveBalance = await getOne('SELECT sick_leave, casual_leave, earned_leave, deducted_leave FROM leave_balances WHERE user_id = ?', [req.user.id]);

    res.json({
      success: true,
      user: {
        ...user,
        leaveBalance: leaveBalance || { sick_leave: 12, casual_leave: 10, earned_leave: 15, deducted_leave: 0 }
      }
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ success: false, message: 'Error retrieving user profile' });
  }
}

module.exports = {
  register,
  login,
  getProfile
};
