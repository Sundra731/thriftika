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
      default: 'escrow', // All payments go through escrow by default
    },
    // Escrow system fields
    escrowHeld: {
      type: Boolean,
      default: false,
    },
    escrowHeldAt: {
      type: Date,
    },
    escrowReleaseDate: {
      type: Date,
    },
    autoReleaseAfterHours: {
      type: Number,
      default: 72, // Auto-release after 72 hours if buyer doesn't confirm
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
    courierName: {
      type: String,
      enum: ['dhl', 'fedex', 'ups', 'tnt', 'aramex', 'post-office', 'local-courier', 'other'],
    },
    courierTrackingUrl: {
      type: String, // URL template for tracking
    },
    trackingUpdates: [
      {
        status: {
          type: String,
          enum: ['order-placed', 'processing', 'shipped', 'in-transit', 'out-for-delivery', 'delivered', 'failed-delivery', 'returned'],
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        location: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'payment-pending', 'payment-confirmed', 'in-escrow', 'shipped', 'delivered', 'delivery-confirmed', 'completed', 'disputed', 'cancelled'],
      default: 'pending',
    },
    // Delivery confirmation fields
    shippingProof: {
      type: String, // URL to shipping proof image/document
    },
    shippingProofUploadedAt: {
      type: Date,
    },
    deliveryConfirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Buyer who confirmed delivery
    },
    deliveryConfirmedAt: {
      type: Date,
    },
    autoConfirmedAt: {
      type: Date, // Auto-confirmation timestamp
    },
    buyerNotes: {
      type: String,
    },
    sellerNotes: {
      type: String,
    },
    disputeReason: {
      type: String,
    },
    resolution: {
      type: String,
      enum: ['refund-buyer', 'release-seller', 'partial-refund', 'pending'],
    },
    // Payment release tracking
    paymentReleasedAt: {
      type: Date,
    },
    paymentReleasedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // M-Pesa specific fields
    phoneNumber: {
      type: String,
    },
    mpesaCheckoutRequestId: {
      type: String,
    },
    mpesaResponseCode: {
      type: String,
    },
    mpesaResponseDescription: {
      type: String,
    },
    mpesaCustomerMessage: {
      type: String,
    },
    mpesaReceiptNumber: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;


