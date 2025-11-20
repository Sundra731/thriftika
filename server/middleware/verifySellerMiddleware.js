import User from '../models/User.js';

/**
 * Middleware to ensure only verified sellers can access certain routes
 * Must be used after authMiddleware.protect
 */
export const verifySeller = async (req, res, next) => {
  try {
    // Check if user is a seller
    if (req.user.role !== 'seller') {
      return res.status(403).json({
        message: 'Only sellers can access this route',
      });
    }

    // Check if seller is verified
    if (!req.user.isVerified) {
      return res.status(403).json({
        message: 'Seller account must be verified before accessing this route',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying seller status' });
  }
};


