const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  dealName: { type: String, required: true, trim: true },
  dealSize: { type: Number, default: 0 },
  currency: { type: String, required: true, default: 'USD' },
  dealOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  dealStage: { type: String, trim: true, default: '' },
  dealCreatedDate: { type: String, default: '' },
  lastActivityDate: { type: String, default: '' },
  remarks: { type: String, trim: true, default: '' },
  associatedCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  primaryContact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', default: null },
  associatedContacts: { type: [String], default: [] },
  expectedCloseDate: { type: String, default: '' },
  dealProbability: { type: Number, default: 0 },
  lostReason: { type: String, trim: true, default: '' },
  wonReason: { type: String, trim: true, default: '' },
  source: { type: String, trim: true, default: '' },
  nextAction: { type: String, trim: true, default: '' },
  nextStepDueDate: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Deal', dealSchema);
