import Transaction from '../models/Transaction.js';
import Product from '../models/Product.js';
import { initiateSTKPush, querySTKPushStatus, processCallback, validatePhoneNumber } from '../utils/mpesaUtils.js';

/**
 * @route   POST /api/payments/initiate
 * @desc    Initiate M-Pesa payment for a product
 * @access  Private (Buyer)
 */
export const initiatePayment = async (req, res, next) => {
  try {
    const { productId, phoneNumber } = req.body;
    const buyerId = req.user._id;

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Get product details
    const product = await Product.findById(productId).populate('seller', 'name email phone');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isAvailable || product.isSold) {
      return res.status(400).json({ message: 'Product is not available for purchase' });
    }

    // Check if buyer is not the seller
    if (product.seller._id.toString() === buyerId.toString()) {
      return res.status(400).json({ message: 'You cannot purchase your own product' });
    }

    // Check if there's already a pending transaction for this product
    const existingTransaction = await Transaction.findOne({
      product: productId,
      buyer: buyerId,
      status: { $in: ['pending', 'processing'] }
    });

    if (existingTransaction) {
      return res.status(400).json({ message: 'You already have a pending payment for this product' });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      product: productId,
      buyer: buyerId,
      seller: product.seller._id,
      amount: product.price,
      paymentMethod: 'mpesa',
      status: 'processing',
      phoneNumber: phoneNumber,
    });

    // Initiate M-Pesa STK Push
    try {
      const mpesaResponse = await initiateSTKPush(
        phoneNumber,
        product.price,
        `THRIFT-${transaction._id.toString().slice(-8).toUpperCase()}`,
        `Payment for ${product.name}`
      );

      // Update transaction with M-Pesa details
      transaction.mpesaCheckoutRequestId = mpesaResponse.CheckoutRequestID;
      transaction.mpesaResponseCode = mpesaResponse.ResponseCode;
      transaction.mpesaResponseDescription = mpesaResponse.ResponseDescription;
      transaction.mpesaCustomerMessage = mpesaResponse.CustomerMessage;
      await transaction.save();

      res.json({
        success: true,
        message: 'Payment initiated. Please check your phone to complete the transaction.',
        data: {
          transactionId: transaction._id,
          checkoutRequestId: mpesaResponse.CheckoutRequestID,
          customerMessage: mpesaResponse.CustomerMessage,
          amount: product.price,
        },
      });
    } catch (mpesaError) {
      // Update transaction status to failed
      transaction.status = 'failed';
      transaction.failureReason = mpesaError.message;
      await transaction.save();

      throw mpesaError;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/payments/status/:transactionId
 * @desc    Check payment status
 * @access  Private (Buyer who initiated payment)
 */
export const checkPaymentStatus = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user._id;

    const transaction = await Transaction.findById(transactionId)
      .populate('product', 'name price')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is the buyer
    if (transaction.buyer._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If transaction is still processing and has checkout request ID, query M-Pesa
    if (transaction.status === 'processing' && transaction.mpesaCheckoutRequestId) {
      try {
        const statusResponse = await querySTKPushStatus(transaction.mpesaCheckoutRequestId);

        // Update transaction based on M-Pesa response
        if (statusResponse.ResultCode === 0) {
          transaction.status = 'completed';
          transaction.mpesaReceiptNumber = statusResponse.ReceiptNumber;
          transaction.completedAt = new Date();

          // Mark product as sold
          await Product.findByIdAndUpdate(transaction.product._id, {
            isSold: true,
            isAvailable: false,
            soldAt: new Date(),
            soldTo: transaction.buyer._id,
          });
        } else {
          transaction.status = 'failed';
          transaction.failureReason = statusResponse.ResultDesc;
        }

        await transaction.save();
      } catch (queryError) {
        console.error('Error querying payment status:', queryError);
        // Don't update status if query fails
      }
    }

    res.json({
      success: true,
      data: {
        transaction: {
          id: transaction._id,
          status: transaction.status,
          amount: transaction.amount,
          product: {
            name: transaction.product.name,
            price: transaction.product.price,
          },
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt,
          receiptNumber: transaction.mpesaReceiptNumber,
          failureReason: transaction.failureReason,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/payments/my-transactions
 * @desc    Get user's transactions (as buyer or seller)
 * @access  Private
 */
export const getUserTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get transactions where user is buyer or seller
    const transactions = await Transaction.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate('product', 'name price images')
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      data: transactions.map(transaction => ({
        id: transaction._id,
        status: transaction.status,
        amount: transaction.amount,
        role: transaction.buyer._id.toString() === userId.toString() ? 'buyer' : 'seller',
        product: {
          name: transaction.product.name,
          price: transaction.product.price,
          image: transaction.product.images?.[0],
        },
        otherParty: transaction.buyer._id.toString() === userId.toString()
          ? { name: transaction.seller.name, email: transaction.seller.email }
          : { name: transaction.buyer.name, email: transaction.buyer.email },
        createdAt: transaction.createdAt,
        completedAt: transaction.completedAt,
        receiptNumber: transaction.mpesaReceiptNumber,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/payments/callback
 * @desc    M-Pesa callback endpoint
 * @access  Public (Called by M-Pesa)
 */
export const mpesaCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    console.log('M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));

    const result = processCallback(callbackData);

    if (result.success) {
      // Find transaction by checkout request ID (we'll need to store this mapping)
      // For now, we'll use the account reference which contains the transaction ID
      const accountReference = callbackData.Body.stkCallback.CallbackMetadata?.Item?.find(
        item => item.Name === 'AccountReference'
      )?.Value;

      if (accountReference && accountReference.startsWith('THRIFT-')) {
        const transactionId = accountReference.replace('THRIFT-', '').toLowerCase();
        // This is a simplified approach - in production you'd want a more robust mapping

        // For now, we'll update based on receipt number or other identifiers
        // This would need to be enhanced for production use
      }
    }

    // Always respond with success to M-Pesa
    res.json({ success: true });
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    // Still respond with success to avoid retries
    res.json({ success: true });
  }
};