const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  check_in: { type: String },
  check_out: { type: String },
  working_hours: { type: Number, default: 0.0 },
  overtime_hours: { type: Number, default: 0.0 },
  status: { type: String, enum: ['PRESENT', 'LATE', 'HALF_DAY', 'ABSENT', 'ON_LEAVE'], default: 'PRESENT' },
  notes: { type: String }
}, { timestamps: true });

attendanceSchema.index({ user_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
