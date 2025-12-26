import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function() {
        // Password is only required if user doesn't have googleId (not an OAuth user)
        return !this.googleId;
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['buyer', 'seller'],
      default: 'buyer',
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      country: String,
      postalCode: String,
    },
    isVerified: {
      type: Boolean,
      default: false, // For sellers, this indicates verification status
    },
    // Enhanced verification fields - Security measure #2
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerifiedAt: {
      type: Date,
    },
    selfieVerified: {
      type: Boolean,
      default: false,
    },
    selfieImage: {
      type: String, // URL to selfie with ID
    },
    selfieVerifiedAt: {
      type: Date,
    },
    profileCompleteness: {
      type: Number,
      default: 0, // Percentage 0-100
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String, // URL to profile image
    },
    googleId: {
      type: String, // Google OAuth ID
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
    },
    // Two-Factor Authentication fields
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorMethod: {
      type: String,
      enum: ['email', 'sms', 'authenticator'],
      default: 'email',
    },
    twoFactorSecret: {
      type: String, // For TOTP authenticator apps
      select: false,
    },
    twoFactorBackupCodes: [{
      type: String,
      select: false,
    }],
    twoFactorTempSecret: {
      type: String, // Temporary secret during setup
      select: false,
    },
    twoFactorVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (only if password exists and is modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;


