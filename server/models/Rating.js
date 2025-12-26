import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // Rating fields - Security measure #4
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    communicationRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    itemAsDescribed: {
      type: Number,
      min: 1,
      max: 5,
    },
    shippingSpeed: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
    },
    // Complaint/dispute tracking
    isComplaint: {
      type: Boolean,
      default: false,
    },
    complaintReason: {
      type: String,
      enum: [
        'item-not-received',
        'item-damaged',
        'wrong-item',
        'fake-product',
        'poor-quality',
        'seller-scam',
        'other',
      ],
    },
    complaintDetails: {
      type: String,
    },
    complaintResolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
ratingSchema.index({ seller: 1, createdAt: -1 });
ratingSchema.index({ transaction: 1 }, { unique: true }); // One rating per transaction

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;




