const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  site: { type: String, trim: true, default: '' },
  owner: { type: String, trim: true, default: '' },
  source: { type: [String], default: [] },
  priority: { type: String, trim: true, default: '' },
  stage: { type: String, trim: true, default: '' },
  notes: { type: String, trim: true, default: '' },
  nextSteps: { type: String, trim: true, default: '' },
  nextActionDate: { type: String, default: '' },
  lastActivityDate: { type: String, default: '' },
  country: { type: String, trim: true, default: '' },
  city: { type: String, trim: true, default: '' },
  custom: { type: mongoose.Schema.Types.Mixed, default: {} },
  employeeSize: { type: String, trim: true, default: '' },
  linkedin: { type: String, trim: true, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
