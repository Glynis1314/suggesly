const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  dealName: { type: String, required: true, trim: true },
  dealSize: { type: Number, default: 0 },
  dealOwner: { type: String, trim: true, default: '' },
  dealStage: { type: String, trim: true, default: '' },
  dealCreatedDate: { type: String, default: '' },
  lastActivityDate: { type: String, default: '' },
  remarks: { type: String, trim: true, default: '' },
  associatedCompany: { type: String, trim: true, default: '' }, // Reference ID or plain text
  primaryContact: { type: String, trim: true, default: '' }, // Reference ID or plain text
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
