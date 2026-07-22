const mongoose = require('mongoose');

// Contact schema definition
const contactSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    jobTitle: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    linkedin: {
      type: String,
      trim: true,
      default: '',
    },
    stage: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'],
      default: 'New',
    },
    country: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
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

// Virtual getter for fullName
contactSchema.virtual('fullName').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Backwards compatibility virtual name
contactSchema.virtual('name').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Virtual getter for ownerName
contactSchema.virtual('ownerName').get(function () {
  if (!this.owner) return '';
  return `${this.owner.firstName || ''} ${this.owner.lastName || ''}`.trim() || this.owner.name || '';
});

// Virtual getter for companyName
contactSchema.virtual('companyName').get(function () {
  return this.company?.company || '';
});

// Indexes definitions
contactSchema.index({ email: 1 });
contactSchema.index({ company: 1 });
contactSchema.index({ owner: 1 });

module.exports = mongoose.model('Contact', contactSchema);
