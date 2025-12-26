import Dispute from '../models/Dispute.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

/**
 * @route   GET /api/disputes/test
 * @desc    Test disputes route
 * @access  Public
 */
export const testRoute = (req, res) => {
  res.json({ message: 'Disputes route working ✅' });
};

/**
 * @route   POST /api/disputes
 * @desc    Create a new dispute for a transaction
 * @access  Private (Buyer or Seller)
 */
export const createDispute = async (req, res, next) => {
  try {
    const { transactionId, reason, description, evidence } = req.body;

    // Validate transaction exists
    const transaction = await Transaction.findById(transactionId)
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is buyer or seller
    const isBuyer = transaction.buyer._id.toString() === req.user._id.toString();
    const isSeller = transaction.seller._id.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to create dispute for this transaction' });
    }

    // Check if transaction is in a disputable state
    if (!['in-escrow', 'shipped', 'delivered', 'delivery-confirmed'].includes(transaction.status)) {
      return res.status(400).json({ message: 'Transaction is not in a disputable state' });
    }

    // Check if dispute already exists
    const existingDispute = await Dispute.findOne({ transaction: transactionId });
    if (existingDispute) {
      return res.status(400).json({ message: 'A dispute already exists for this transaction' });
    }

    // Determine priority based on reason
    let priority = 'medium';
    if (reason === 'fake-item' || reason === 'non-delivery') {
      priority = 'high';
    }

    // Create dispute
    const dispute = await Dispute.create({
      transaction: transactionId,
      initiatedBy: req.user._id,
      reason,
      description,
      evidence: evidence || [],
      priority,
    });

    // Update transaction status
    transaction.status = 'disputed';
    await transaction.save();

    // Populate dispute
    await dispute.populate('transaction', 'amount status');
    await dispute.populate('initiatedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Dispute created successfully. Our team will review it shortly.',
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/disputes/my-disputes
 * @desc    Get all disputes for logged-in user
 * @access  Private
 */
export const getMyDisputes = async (req, res, next) => {
  try {
    // Find all transactions where user is buyer or seller
    const userTransactions = await Transaction.find({
      $or: [
        { buyer: req.user._id },
        { seller: req.user._id }
      ]
    }).select('_id');

    const transactionIds = userTransactions.map(t => t._id);

    const disputes = await Dispute.find({ transaction: { $in: transactionIds } })
      .populate('transaction', 'amount status product')
      .populate('initiatedBy', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: disputes.length,
      data: disputes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/disputes/:id
 * @desc    Get single dispute by ID
 * @access  Private
 */
export const getDispute = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('transaction')
      .populate('initiatedBy', 'name email')
      .populate('resolvedBy', 'name email');

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    // Check authorization
    const transaction = dispute.transaction;
    const isBuyer = transaction.buyer.toString() === req.user._id.toString();
    const isSeller = transaction.seller.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to view this dispute' });
    }

    res.json({
      success: true,
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/disputes/:id/response
 * @desc    Add response to dispute (buyer or seller)
 * @access  Private
 */
export const addDisputeResponse = async (req, res, next) => {
  try {
    const { response } = req.body;

    const dispute = await Dispute.findById(req.params.id).populate('transaction');

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    // Check authorization
    const transaction = dispute.transaction;
    const isBuyer = transaction.buyer.toString() === req.user._id.toString();
    const isSeller = transaction.seller.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to respond to this dispute' });
    }

    // Add response
    if (isBuyer) {
      dispute.buyerResponse = response;
    } else {
      dispute.sellerResponse = response;
    }

    await dispute.save();

    res.json({
      success: true,
      message: 'Response added successfully',
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/disputes/admin/all
 * @desc    Get all disputes (Admin only)
 * @access  Private (Admin)
 */
export const getAllDisputes = async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const disputes = await Dispute.find(filter)
      .populate('transaction', 'amount status product buyer seller')
      .populate('initiatedBy', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: disputes.length,
      data: disputes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/disputes/:id/resolve
 * @desc    Resolve a dispute (Admin only)
 * @access  Private (Admin)
 */
export const resolveDispute = async (req, res, next) => {
  try {
    const { resolution, resolutionDetails, sellerPenalty, penaltyReason, penaltyDuration } = req.body;

    const dispute = await Dispute.findById(req.params.id).populate('transaction');

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    if (dispute.status === 'resolved') {
      return res.status(400).json({ message: 'Dispute is already resolved' });
    }

    // Update dispute
    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.resolutionDetails = resolutionDetails;
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();

    if (sellerPenalty) {
      dispute.sellerPenalty = sellerPenalty;
      dispute.penaltyReason = penaltyReason;
      if (penaltyDuration) {
        dispute.penaltyDuration = penaltyDuration;
      }
    }

    await dispute.save();

    // Update transaction
    const transaction = dispute.transaction;
    transaction.resolution = resolution;
    transaction.status = 'completed'; // Or appropriate status
    await transaction.save();

    // Handle seller penalties
    if (sellerPenalty !== 'none') {
      const seller = await User.findById(transaction.seller);

      if (sellerPenalty === 'temporary-suspension') {
        seller.isActive = false;
        // Set suspension end date (would need additional logic for reactivation)
      } else if (sellerPenalty === 'permanent-suspension') {
        seller.isActive = false;
        // Permanent suspension
      }
      await seller.save();
    }

    res.json({
      success: true,
      message: 'Dispute resolved successfully',
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};