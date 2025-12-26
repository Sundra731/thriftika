import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
      unique: true, // One dispute per transaction
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      enum: [
        'fake-item',
        'non-delivery',
        'wrong-item',
        'damaged-goods',
        'other',
      ],
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide details about the dispute'],
      trim: true,
    },
    evidence: [
      {
        type: String, // URLs to images, documents, or screenshots
      },
    ],
    status: {
      type: String,
      enum: ['open', 'under-review', 'resolved', 'closed'],
      default: 'open',
    },
    resolution: {
      type: String,
      enum: ['refund-buyer', 'release-seller', 'partial-refund', 'dismissed'],
    },
    resolutionDetails: {
      type: String,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Admin who resolved
    },
    resolvedAt: {
      type: Date,
    },
    buyerResponse: {
      type: String,
    },
    sellerResponse: {
      type: String,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    // Penalty fields for sellers
    sellerPenalty: {
      type: String,
      enum: ['none', 'warning', 'temporary-suspension', 'permanent-suspension'],
      default: 'none',
    },
    penaltyReason: {
      type: String,
    },
    penaltyDuration: {
      type: Number, // Days for temporary suspension
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
disputeSchema.index({ transaction: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ initiatedBy: 1 });

const Dispute = mongoose.model('Dispute', disputeSchema);

export default Dispute;