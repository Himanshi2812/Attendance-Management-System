const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['EMPLOYEE', 'HR_ADMIN'], default: 'EMPLOYEE' },
  department: { type: String, default: 'General' },
  position: { type: String, default: 'Staff Member' },
  employee_code: { type: String, required: true, unique: true },
  join_date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
