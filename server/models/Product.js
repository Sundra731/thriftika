import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      enum: ['tops', 'bottoms', 'dresses', 'shoes', 'accessories', 'outerwear', 'other'],
      default: 'other',
    },
    size: {
      type: String,
      trim: true,
    },
    condition: {
      type: String,
      enum: ['new', 'like-new', 'good', 'fair', 'poor'],
      default: 'good',
    },
    images: [
      {
        type: String, // URLs to product images
      },
    ],
    // Thriftika Tag Photo - Security measure #3
    thriftikaTagPhoto: {
      type: String, // URL to photo with handwritten "Thriftika + Date" note
      required: [true, 'Thriftika tag photo is required for all listings'],
    },
    tagPhotoDate: {
      type: Date, // Date shown in the tag photo
      required: true,
    },
    tagPhotoVerified: {
      type: Boolean,
      default: false, // Admin verification of tag photo
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isSold: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    tags: [String], // For search and filtering
  },
  {
    timestamps: true,
  }
);

// Index for search functionality
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;


