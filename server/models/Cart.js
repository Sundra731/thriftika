import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One cart per user
    },
    items: [cartItemSchema],
    totalItems: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
cartSchema.index({ user: 1 });

// Pre-save middleware to calculate totals
cartSchema.pre('save', async function (next) {
  try {
    // Populate product details to calculate prices
    await this.populate('items.product');

    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);

    this.totalPrice = this.items.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);

    next();
  } catch (error) {
    next(error);
  }
});

// Method to add item to cart
cartSchema.methods.addItem = function (productId, quantity = 1) {
  const existingItem = this.items.find(item =>
    item.product.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({ product: productId, quantity });
  }
};

// Method to remove item from cart
cartSchema.methods.removeItem = function (productId) {
  this.items = this.items.filter(item =>
    item.product.toString() !== productId.toString()
  );
};

// Method to update item quantity
cartSchema.methods.updateQuantity = function (productId, quantity) {
  const item = this.items.find(item =>
    item.product.toString() === productId.toString()
  );

  if (item) {
    if (quantity <= 0) {
      this.removeItem(productId);
    } else {
      item.quantity = quantity;
    }
  }
};

// Method to clear cart
cartSchema.methods.clearCart = function () {
  this.items = [];
  this.totalItems = 0;
  this.totalPrice = 0;
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;