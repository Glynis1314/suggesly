const mongoose = require('mongoose');

// Deal schema definition
const dealSchema = new mongoose.Schema(
  {
    dealName: {
      type: String,
      required: true,
      trim: true,
    },
    associatedCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    primaryContact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      default: null,
    },
    dealStage: {
      type: String,
      enum: ['Lead', 'New', 'Qualified', 'Proposal', 'Negotiation', 'Contacted', 'Closed Won', 'Closed Lost'],
      default: 'New',
    },
    dealValue: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    dealSource: {
      type: String,
      trim: true,
      default: '',
    },
    expectedCloseDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual getter for ownerName
dealSchema.virtual('ownerName').get(function () {
  if (!this.owner) return '';
  return `${this.owner.firstName || ''} ${this.owner.lastName || ''}`.trim() || this.owner.name || '';
});

// Virtual getter for companyName
dealSchema.virtual('companyName').get(function () {
  return this.associatedCompany?.company || '';
});

// Virtual getter for contactName
dealSchema.virtual('contactName').get(function () {
  if (!this.primaryContact) return '';
  return `${this.primaryContact.firstName || ''} ${this.primaryContact.lastName || ''}`.trim() || this.primaryContact.name || '';
});

// Indexes definitions
dealSchema.index({ owner: 1 });
dealSchema.index({ dealStage: 1 });
dealSchema.index({ associatedCompany: 1 });

module.exports = mongoose.model('Deal', dealSchema);
