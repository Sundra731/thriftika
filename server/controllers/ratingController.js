import Rating from '../models/Rating.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

/**
 * @route   POST /api/ratings
 * @desc    Create a rating/review for a seller
 * @access  Private (Buyer)
 */
export const createRating = async (req, res, next) => {
  try {
    const {
      transactionId,
      overallRating,
      communicationRating,
      itemAsDescribed,
      shippingSpeed,
      review,
      isComplaint,
      complaintReason,
      complaintDetails,
    } = req.body;

    // Get transaction
    const transaction = await Transaction.findById(transactionId)
      .populate('buyer')
      .populate('seller')
      .populate('product');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is the buyer
    if (transaction.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the buyer can rate the seller' });
    }

    // Check if transaction is completed
    if (transaction.status !== 'completed' && transaction.status !== 'delivery-confirmed') {
      return res.status(400).json({ message: 'Transaction must be completed before rating' });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({ transaction: transactionId });
    if (existingRating) {
      return res.status(400).json({ message: 'Rating already exists for this transaction' });
    }

    // Create rating
    const rating = await Rating.create({
      buyer: req.user._id,
      seller: transaction.seller._id,
      transaction: transactionId,
      product: transaction.product._id,
      overallRating,
      communicationRating,
      itemAsDescribed,
      shippingSpeed,
      review,
      isComplaint: isComplaint || false,
      complaintReason: isComplaint ? complaintReason : undefined,
      complaintDetails: isComplaint ? complaintDetails : undefined,
    });

    // Update seller's overall rating stats (calculate average)
    await updateSellerRatingStats(transaction.seller._id);

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: rating,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/ratings/seller/:sellerId
 * @desc    Get all ratings for a seller
 * @access  Public
 */
export const getSellerRatings = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const ratings = await Rating.find({ seller: sellerId })
      .populate('buyer', 'name')
      .populate('product', 'name images')
      .populate('transaction', 'status completedAt')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = calculateSellerStats(ratings);

    res.json({
      success: true,
      count: ratings.length,
      stats,
      data: ratings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/ratings/seller/:sellerId/stats
 * @desc    Get seller rating statistics
 * @access  Public
 */
export const getSellerStats = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const ratings = await Rating.find({ seller: sellerId });

    const stats = calculateSellerStats(ratings);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to calculate seller statistics
 */
const calculateSellerStats = (ratings) => {
  if (ratings.length === 0) {
    return {
      overallScore: 0,
      totalRatings: 0,
      totalComplaints: 0,
      deliverySuccessRate: 0,
      averageCommunication: 0,
      averageItemAsDescribed: 0,
      averageShippingSpeed: 0,
      complaintReasons: {},
    };
  }

  const totalRatings = ratings.length;
  const totalComplaints = ratings.filter((r) => r.isComplaint).length;
  const completedTransactions = ratings.filter(
    (r) => r.transaction?.status === 'completed' || r.transaction?.status === 'delivery-confirmed'
  ).length;

  const overallScore =
    ratings.reduce((sum, r) => sum + r.overallRating, 0) / totalRatings;

  const averageCommunication =
    ratings
      .filter((r) => r.communicationRating)
      .reduce((sum, r) => sum + r.communicationRating, 0) /
    ratings.filter((r) => r.communicationRating).length || 0;

  const averageItemAsDescribed =
    ratings
      .filter((r) => r.itemAsDescribed)
      .reduce((sum, r) => sum + r.itemAsDescribed, 0) /
    ratings.filter((r) => r.itemAsDescribed).length || 0;

  const averageShippingSpeed =
    ratings
      .filter((r) => r.shippingSpeed)
      .reduce((sum, r) => sum + r.shippingSpeed, 0) /
    ratings.filter((r) => r.shippingSpeed).length || 0;

  const deliverySuccessRate = (completedTransactions / totalRatings) * 100;

  // Count complaint reasons
  const complaintReasons = {};
  ratings
    .filter((r) => r.isComplaint && r.complaintReason)
    .forEach((r) => {
      complaintReasons[r.complaintReason] = (complaintReasons[r.complaintReason] || 0) + 1;
    });

  return {
    overallScore: parseFloat(overallScore.toFixed(2)),
    totalRatings,
    totalComplaints,
    deliverySuccessRate: parseFloat(deliverySuccessRate.toFixed(2)),
    averageCommunication: parseFloat(averageCommunication.toFixed(2)),
    averageItemAsDescribed: parseFloat(averageItemAsDescribed.toFixed(2)),
    averageShippingSpeed: parseFloat(averageShippingSpeed.toFixed(2)),
    complaintReasons,
  };
};

/**
 * Helper function to update seller's rating statistics in User model
 */
const updateSellerRatingStats = async (sellerId) => {
  const ratings = await Rating.find({ seller: sellerId });
  const stats = calculateSellerStats(ratings);

  // You can store these stats in the User model if needed
  // For now, we'll just calculate them on-demand
  return stats;
};




