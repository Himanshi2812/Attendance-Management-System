const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  sick_leave: { type: Number, default: 12.0 },
  casual_leave: { type: Number, default: 10.0 },
  earned_leave: { type: Number, default: 15.0 },
  deducted_leave: { type: Number, default: 0.0 }
}, { timestamps: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
