import Transaction from '../models/Transaction.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { checkAndAutoReleaseEscrow } from '../utils/escrowAutoRelease.js';

/**
 * @route   POST /api/escrow/initiate
 * @desc    Initiate escrow payment (buyer pays, money held in escrow)
 * @access  Private (Buyer)
 */
export const initiateEscrowPayment = async (req, res, next) => {
  try {
    const { productId, shippingAddress } = req.body;
    const buyerId = req.user._id;

    // Get product
    const product = await Product.findById(productId).populate('seller');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is available
    if (!product.isAvailable || product.isSold) {
      return res.status(400).json({ message: 'Product is no longer available' });
    }

    // Check if buyer is trying to buy their own product
    if (product.seller._id.toString() === buyerId.toString()) {
      return res.status(400).json({ message: 'You cannot buy your own product' });
    }

    // Check if seller is verified (optional but recommended)
    if (!product.seller.isVerified) {
      return res.status(400).json({ 
        message: 'This seller is not verified. For your safety, we only allow purchases from verified sellers.' 
      });
    }

    // Create transaction with escrow
    const transaction = await Transaction.create({
      buyer: buyerId,
      seller: product.seller._id,
      product: productId,
      amount: product.price,
      paymentMethod: 'escrow',
      paymentStatus: 'pending',
      status: 'payment-pending',
      shippingAddress,
      escrowHeld: false, // Will be set to true after payment
    });

    // Mark product as sold (reserved)
    product.isSold = true;
    product.isAvailable = false;
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Transaction created. Please complete payment to hold funds in escrow.',
      data: {
        transactionId: transaction._id,
        amount: product.price,
        // In production, this would initiate actual payment processing
        // For now, we'll use a confirm-payment endpoint
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/escrow/:transactionId/confirm-payment
 * @desc    Confirm payment and move funds to escrow
 * @access  Private (Buyer)
 */
export const confirmEscrowPayment = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId)
      .populate('buyer')
      .populate('seller')
      .populate('product');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is the buyer
    if (transaction.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the buyer can confirm payment' });
    }

    // Check if payment already confirmed
    if (transaction.paymentStatus === 'in-escrow') {
      return res.status(400).json({ message: 'Payment already in escrow' });
    }

    // Move payment to escrow
    transaction.paymentStatus = 'in-escrow';
    transaction.status = 'in-escrow';
    transaction.escrowHeld = true;
    transaction.escrowHeldAt = new Date();
    
    // Set auto-release date (default 72 hours after delivery confirmation or shipping)
    const autoReleaseDate = new Date();
    autoReleaseDate.setHours(autoReleaseDate.getHours() + transaction.autoReleaseAfterHours);
    transaction.escrowReleaseDate = autoReleaseDate;

    await transaction.save();

    res.json({
      success: true,
      message: 'Payment confirmed and held in escrow. Seller will be notified to ship.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/escrow/:transactionId/upload-shipping
 * @desc    Seller uploads shipping proof
 * @access  Private (Seller)
 */
export const uploadShippingProof = async (req, res, next) => {
  try {
    const { shippingProof, trackingNumber } = req.body;
    const transaction = await Transaction.findById(req.params.transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is the seller
    if (transaction.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the seller can upload shipping proof' });
    }

    // Check if payment is in escrow
    if (transaction.paymentStatus !== 'in-escrow') {
      return res.status(400).json({ message: 'Payment must be in escrow before shipping' });
    }

    // Update transaction with shipping info
    transaction.shippingProof = shippingProof;
    transaction.shippingProofUploadedAt = new Date();
    transaction.status = 'shipped';
    if (trackingNumber) {
      transaction.trackingNumber = trackingNumber;
    }

    await transaction.save();

    res.json({
      success: true,
      message: 'Shipping proof uploaded. Buyer will be notified.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/escrow/:transactionId/confirm-delivery
 * @desc    Buyer confirms delivery - releases escrow to seller
 * @access  Private (Buyer)
 */
export const confirmDelivery = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId)
      .populate('seller');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is the buyer
    if (transaction.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the buyer can confirm delivery' });
    }

    // Check if payment is in escrow
    if (transaction.paymentStatus !== 'in-escrow') {
      return res.status(400).json({ message: 'Payment is not in escrow' });
    }

    // Release escrow to seller
    transaction.paymentStatus = 'released';
    transaction.status = 'delivery-confirmed';
    transaction.deliveryConfirmedBy = req.user._id;
    transaction.deliveryConfirmedAt = new Date();
    transaction.paymentReleasedAt = new Date();
    transaction.paymentReleasedTo = transaction.seller._id;
    transaction.completedAt = new Date();

    await transaction.save();

    res.json({
      success: true,
      message: 'Delivery confirmed. Payment has been released to the seller.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/escrow/:transactionId/dispute
 * @desc    Buyer or seller opens a dispute
 * @access  Private
 */
export const openDispute = async (req, res, next) => {
  try {
    const { reason, details } = req.body;
    const transaction = await Transaction.findById(req.params.transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is buyer or seller
    const isBuyer = transaction.buyer.toString() === req.user._id.toString();
    const isSeller = transaction.seller.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Only buyer or seller can open a dispute' });
    }

    // Check if payment is in escrow
    if (transaction.paymentStatus !== 'in-escrow') {
      return res.status(400).json({ message: 'Disputes can only be opened for escrow payments' });
    }

    // Open dispute
    transaction.status = 'disputed';
    transaction.disputeReason = reason;
    transaction.resolution = 'pending';

    await transaction.save();

    res.json({
      success: true,
      message: 'Dispute opened. Thriftika support will review and resolve.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/escrow/my-escrow
 * @desc    Get user's escrow transactions
 * @access  Private
 */
export const getMyEscrowTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    // Check for auto-release before fetching
    await checkAndAutoReleaseEscrow();

    const filter = {
      $or: [{ buyer: userId }, { seller: userId }],
      paymentMethod: 'escrow',
    };

    if (status) {
      filter.status = status;
    }

    const transactions = await Transaction.find(filter)
      .populate('buyer', 'name email')
      .populate('seller', 'name email isVerified')
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

