import Transaction from '../models/Transaction.js';

/**
 * Check and auto-release escrow payments that have passed their release date
 * This should be called periodically (e.g., when checking transaction status)
 */
export const checkAndAutoReleaseEscrow = async () => {
  try {
    const now = new Date();
    
    // Find transactions that should be auto-released
    const transactionsToRelease = await Transaction.find({
      paymentStatus: 'in-escrow',
      status: { $in: ['shipped', 'delivered'] },
      shippingProofUploadedAt: { $exists: true },
      deliveryConfirmedAt: { $exists: false },
      autoConfirmedAt: { $exists: false },
      $or: [
        // Auto-release after 72 hours of shipping proof upload
        {
          shippingProofUploadedAt: {
            $lte: new Date(now.getTime() - 72 * 60 * 60 * 1000), // 72 hours ago
          },
        },
        // Or if escrowReleaseDate has passed
        {
          escrowReleaseDate: {
            $lte: now,
          },
        },
      ],
    }).populate('seller');

    for (const transaction of transactionsToRelease) {
      // Auto-release to seller
      transaction.paymentStatus = 'released';
      transaction.status = 'completed';
      transaction.autoConfirmedAt = new Date();
      transaction.paymentReleasedAt = new Date();
      transaction.paymentReleasedTo = transaction.seller._id;
      transaction.completedAt = new Date();
      await transaction.save();

      console.log(`Auto-released escrow for transaction ${transaction._id}`);
    }

    if (transactionsToRelease.length > 0) {
      console.log(`Auto-released ${transactionsToRelease.length} escrow payment(s)`);
    }

    return transactionsToRelease.length;
  } catch (error) {
    console.error('Error in escrow auto-release check:', error);
    return 0;
  }
};

/**
 * Set up interval to check for auto-release (runs every hour)
 */
export const setupEscrowAutoRelease = () => {
  // Check immediately on startup
  checkAndAutoReleaseEscrow();
  
  // Then check every hour
  setInterval(() => {
    checkAndAutoReleaseEscrow();
  }, 60 * 60 * 1000); // 1 hour

  console.log('Escrow auto-release check scheduled (runs every hour)');
};

