const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  initials: { type: String, trim: true, default: '' },
  company: { type: String, trim: true, default: '' }, // Can store plain text company name or reference ID
  email: { type: String, trim: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  location: { type: String, trim: true, default: '' },
  country: { type: String, trim: true, default: '' },
  owner: { type: String, trim: true, default: '' },
  stage: { type: String, trim: true, default: '' },
  activity: { type: String, default: '' },
  notes: { type: String, trim: true, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
