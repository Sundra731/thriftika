import express from 'express';
import {
  initiatePayment,
  checkPaymentStatus,
  getUserTransactions,
  mpesaCallback,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (M-Pesa callback)
router.post('/callback', mpesaCallback);

// Protected routes
router.post('/initiate', protect, authorize('buyer'), initiatePayment);
router.get('/status/:transactionId', protect, checkPaymentStatus);
router.get('/my-transactions', protect, getUserTransactions);

export default router;