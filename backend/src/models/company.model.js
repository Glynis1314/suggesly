const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  site: { type: String, trim: true, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

companySchema.virtual('companyName').get(function () {
  return this.company;
});

module.exports = mongoose.model('Company', companySchema);
