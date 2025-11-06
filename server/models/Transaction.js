import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
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
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'in-escrow', 'released', 'refunded', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['mpesa', 'bank-transfer', 'escrow', 'cash-on-delivery'],
    },
    shippingAddress: {
      street: String,
      city: String,
      country: String,
      postalCode: String,
    },
    trackingNumber: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'completed', 'disputed', 'cancelled'],
      default: 'pending',
    },
    buyerNotes: {
      type: String,
    },
    sellerNotes: {
      type: String,
    },
    // Escrow fields for buyer protection
    escrowReleaseDate: {
      type: Date,
    },
    disputeReason: {
      type: String,
    },
    resolution: {
      type: String,
      enum: ['refund-buyer', 'release-seller', 'partial-refund', 'pending'],
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

