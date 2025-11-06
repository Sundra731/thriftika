import express from 'express';
import {
  testRoute,
  submitVerification,
  getVerificationStatus,
  getAllVerifications,
  approveVerification,
  rejectVerification,
} from '../controllers/verificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route
router.get('/test', testRoute);

// Seller routes
router.post('/submit', protect, authorize('seller'), submitVerification);
router.get('/status', protect, authorize('seller'), getVerificationStatus);

// Admin routes (placeholder - add admin role check in future)
router.get('/all', protect, getAllVerifications);
router.put('/:id/approve', protect, approveVerification);
router.put('/:id/reject', protect, rejectVerification);

export default router;

