const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leave_type: { type: String, enum: ['CASUAL', 'SICK', 'EARNED'], required: true },
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  total_days: { type: Number, required: true },
  reason: { type: String },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  hr_comments: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
