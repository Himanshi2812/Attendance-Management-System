const mongoose = require('mongoose');

const companySettingsSchema = new mongoose.Schema({
  work_start_time: { type: String, default: '09:00' },
  work_end_time: { type: String, default: '17:00' },
  grace_period_mins: { type: Number, default: 15 },
  late_count_deduction_threshold: { type: Number, default: 3 }
}, { timestamps: true });

module.exports = mongoose.model('CompanySettings', companySettingsSchema);
