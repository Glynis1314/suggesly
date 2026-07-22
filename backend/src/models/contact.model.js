const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  email: { type: String, trim: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  location: { type: String, trim: true, default: '' },
  country: { type: String, trim: true, default: '' },
  city: { type: String, trim: true, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  stage: { type: String, trim: true, default: '' },
  activity: { type: String, default: '' },
  notes: { type: String, trim: true, default: '' },
  jobTitle: { type: String, trim: true, default: '' },
  linkedin: { type: String, trim: true, default: '' },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

contactSchema.virtual('name').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

contactSchema.virtual('initials').get(function() {
  const first = this.firstName ? this.firstName.charAt(0) : '';
  const last = this.lastName ? this.lastName.charAt(0) : '';
  return `${first}${last}`.toUpperCase() || '?';
});

module.exports = mongoose.model('Contact', contactSchema);
