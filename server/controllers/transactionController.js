import Transaction from '../models/Transaction.js';
import Product from '../models/Product.js';

/**
 * @route   GET /api/transactions/test
 * @desc    Test transactions route
 * @access  Public
 */
export const testRoute = (req, res) => {
  res.json({ message: 'Transactions route working ✅' });
};

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction (buyer initiates purchase)
 * @access  Private (Buyer)
 */
export const createTransaction = async (req, res, next) => {
  try {
    const { productId, paymentMethod, shippingAddress } = req.body;

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is available
    if (!product.isAvailable || product.isSold) {
      return res.status(400).json({ message: 'Product is no longer available' });
    }

    // Check if buyer is trying to buy their own product
    if (product.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot buy your own product' });
    }

    // Create transaction
    const transaction = await Transaction.create({
      buyer: req.user._id,
      seller: product.seller,
      product: productId,
      amount: product.price,
      paymentMethod,
      shippingAddress,
      paymentStatus: 'pending',
      status: 'pending',
    });

    // Mark product as sold
    product.isSold = true;
    product.isAvailable = false;
    await product.save();

    // Populate references
    await transaction.populate('buyer', 'name email');
    await transaction.populate('seller', 'name email');
    await transaction.populate('product', 'name price images');

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions for logged-in user
 * @access  Private
 */
export const getMyTransactions = async (req, res, next) => {
  try {
    const { role } = req.user;

    // Build filter based on user role
    const filter = role === 'buyer' ? { buyer: req.user._id } : { seller: req.user._id };

    const transactions = await Transaction.find(filter)
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('product', 'name price images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/transactions/:id
 * @desc    Get single transaction by ID
 * @access  Private
 */
export const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('buyer', 'name email phone address')
      .populate('seller', 'name email phone address')
      .populate('product', 'name price images description');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is authorized to view this transaction
    const isBuyer = transaction.buyer._id.toString() === req.user._id.toString();
    const isSeller = transaction.seller._id.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to view this transaction' });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/transactions/:id/confirm-payment
 * @desc    Confirm payment (buyer confirms they've paid)
 * @access  Private (Buyer)
 */
export const confirmPayment = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is the buyer
    if (transaction.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the buyer can confirm payment' });
    }

    // Update payment status
    transaction.paymentStatus = 'paid';
    transaction.status = 'confirmed';
    await transaction.save();

    res.json({
      success: true,
      message: 'Payment confirmed',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/transactions/:id/update-status
 * @desc    Update transaction status (seller updates shipping/delivery)
 * @access  Private (Seller)
 */
export const updateTransactionStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is the seller
    if (transaction.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the seller can update transaction status' });
    }

    // Update status
    transaction.status = status;
    if (trackingNumber) transaction.trackingNumber = trackingNumber;
    await transaction.save();

    res.json({
      success: true,
      message: 'Transaction status updated',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};




