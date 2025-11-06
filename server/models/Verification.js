import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    idType: {
      type: String,
      enum: ['national-id', 'passport', 'drivers-license'],
      required: true,
    },
    idNumber: {
      type: String,
      required: true,
    },
    idFrontImage: {
      type: String, // URL to ID front image
      required: true,
    },
    idBackImage: {
      type: String, // URL to ID back image (if applicable)
    },
    businessLicense: {
      type: String, // URL to business license (optional)
    },
    additionalDocuments: [
      {
        type: String, // URLs to additional verification documents
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Admin who reviewed
    },
    reviewNotes: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Verification = mongoose.model('Verification', verificationSchema);

export default Verification;

