import express from 'express';
import {
  createRating,
  getSellerRatings,
  getSellerStats,
} from '../controllers/ratingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/seller/:sellerId', getSellerRatings);
router.get('/seller/:sellerId/stats', getSellerStats);

// Protected routes
router.post('/', protect, authorize('buyer'), createRating);

export default router;




