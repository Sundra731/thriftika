import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedSeller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    reason: {
      type: String,
      enum: [
        'fake-product',
        'item-not-received',
        'item-damaged',
        'wrong-item',
        'scam',
        'fraudulent-payment',
        'other',
      ],
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description of the issue'],
      trim: true,
    },
    evidence: [
      {
        type: String, // URLs to screenshots, images, or documents
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'under-review', 'resolved', 'dismissed'],
      default: 'pending',
    },
    resolution: {
      type: String,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Admin who resolved
    },
    resolvedAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;


