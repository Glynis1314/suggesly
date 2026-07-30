const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ['deal', 'contact', 'company'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'entityModel',
    },
    entityModel: {
      type: String,
      required: true,
      enum: ['Deal', 'Contact', 'Company'],
    },
    text: {
      type: String,
      required: [true, 'Note text is required.'],
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

noteSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
