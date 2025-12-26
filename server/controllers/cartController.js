import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

/**
 * @route   GET /api/cart/test
 * @desc    Test cart route
 * @access  Public
 */
export const testRoute = (req, res) => {
  res.json({ message: 'Cart route working ✅' });
};

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price images condition')
      .populate('user', 'name email');

    // If no cart exists, create an empty one
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
      await cart.populate('items.product', 'name price images condition');
    }

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart
 * @access  Private
 */
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isAvailable || product.isSold) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    // Check if user is trying to add their own product
    if (product.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot add your own product to cart' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Add item to cart
    cart.addItem(productId, quantity);
    await cart.save();
    await cart.populate('items.product', 'name price images condition');

    res.json({
      success: true,
      message: 'Item added to cart',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/cart/update
 * @desc    Update item quantity in cart
 * @access  Private
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.updateQuantity(productId, quantity);
    await cart.save();
    await cart.populate('items.product', 'name price images condition');

    res.json({
      success: true,
      message: 'Cart updated',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/cart/remove/:productId
 * @desc    Remove item from cart
 * @access  Private
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.removeItem(productId);
    await cart.save();
    await cart.populate('items.product', 'name price images condition');

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/cart/clear
 * @desc    Clear entire cart
 * @access  Private
 */
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.clearCart();
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/cart/count
 * @desc    Get cart item count
 * @access  Private
 */
export const getCartCount = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    const count = cart ? cart.totalItems : 0;

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    next(error);
  }
};