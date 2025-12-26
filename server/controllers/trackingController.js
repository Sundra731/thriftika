import Transaction from '../models/Transaction.js';

/**
 * @route   GET /api/tracking/test
 * @desc    Test tracking route
 * @access  Public
 */
export const testRoute = (req, res) => {
  res.json({ message: 'Tracking route working ✅' });
};

/**
 * @route   PUT /api/tracking/:transactionId
 * @desc    Update tracking information (Seller only)
 * @access  Private (Seller)
 */
export const updateTrackingInfo = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { trackingNumber, courierName, courierTrackingUrl } = req.body;

    // Find transaction
    const transaction = await Transaction.findById(transactionId)
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is the seller
    if (transaction.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the seller can update tracking information' });
    }

    // Check if transaction is in appropriate state
    if (!['payment-confirmed', 'in-escrow', 'shipped'].includes(transaction.status)) {
      return res.status(400).json({ message: 'Cannot update tracking for this transaction status' });
    }

    // Update tracking info
    if (trackingNumber) transaction.trackingNumber = trackingNumber;
    if (courierName) transaction.courierName = courierName;
    if (courierTrackingUrl) transaction.courierTrackingUrl = courierTrackingUrl;

    // Add tracking update
    const trackingUpdate = {
      status: 'shipped',
      description: 'Package shipped with tracking information',
      location: 'Origin facility',
      updatedBy: req.user._id,
    };

    transaction.trackingUpdates.push(trackingUpdate);

    // Update transaction status if not already shipped
    if (transaction.status !== 'shipped') {
      transaction.status = 'shipped';
    }

    await transaction.save();

    res.json({
      success: true,
      message: 'Tracking information updated successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tracking/:transactionId/update
 * @desc    Add tracking update (Seller only)
 * @access  Private (Seller)
 */
export const addTrackingUpdate = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { status, description, location } = req.body;

    // Find transaction
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is the seller
    if (transaction.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the seller can add tracking updates' });
    }

    // Add tracking update
    const trackingUpdate = {
      status,
      description,
      location,
      updatedBy: req.user._id,
    };

    transaction.trackingUpdates.push(trackingUpdate);

    // Update transaction status based on tracking status
    if (status === 'delivered') {
      transaction.status = 'delivered';
      transaction.deliveryConfirmedAt = new Date();
    } else if (status === 'shipped' && transaction.status !== 'delivered') {
      transaction.status = 'shipped';
    }

    await transaction.save();

    res.json({
      success: true,
      message: 'Tracking update added successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tracking/:transactionId
 * @desc    Get tracking information
 * @access  Private (Buyer or Seller)
 */
export const getTrackingInfo = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    // Find transaction
    const transaction = await Transaction.findById(transactionId)
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('trackingUpdates.updatedBy', 'name');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check authorization
    const isBuyer = transaction.buyer._id.toString() === req.user._id.toString();
    const isSeller = transaction.seller._id.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to view this tracking information' });
    }

    // Sort tracking updates by timestamp
    const sortedUpdates = transaction.trackingUpdates.sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    const trackingInfo = {
      transactionId: transaction._id,
      trackingNumber: transaction.trackingNumber,
      courierName: transaction.courierName,
      courierTrackingUrl: transaction.courierTrackingUrl,
      currentStatus: transaction.status,
      updates: sortedUpdates,
    };

    res.json({
      success: true,
      data: trackingInfo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tracking/couriers
 * @desc    Get available couriers
 * @access  Public
 */
export const getCouriers = (req, res) => {
  const couriers = [
    { value: 'dhl', label: 'DHL', trackingUrl: 'https://www.dhl.com/en/express/tracking.html?AWB={trackingNumber}' },
    { value: 'fedex', label: 'FedEx', trackingUrl: 'https://www.fedex.com/en-us/tracking.html' },
    { value: 'ups', label: 'UPS', trackingUrl: 'https://www.ups.com/track' },
    { value: 'tnt', label: 'TNT', trackingUrl: 'https://www.tnt.com/express/en_us/site/tracking.html' },
    { value: 'aramex', label: 'Aramex', trackingUrl: 'https://www.aramex.com/us/en/track' },
    { value: 'post-office', label: 'Post Office', trackingUrl: '' },
    { value: 'local-courier', label: 'Local Courier', trackingUrl: '' },
    { value: 'other', label: 'Other', trackingUrl: '' },
  ];

  res.json({
    success: true,
    data: couriers,
  });
};