import express from 'express';
import {
  testRoute,
  createTransaction,
  getMyTransactions,
  getTransaction,
  confirmPayment,
  updateTransactionStatus,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route
router.get('/test', testRoute);

// Protected routes
router.post('/', protect, authorize('buyer'), createTransaction);
router.get('/', protect, getMyTransactions);
router.get('/:id', protect, getTransaction);
router.put('/:id/confirm-payment', protect, authorize('buyer'), confirmPayment);
router.put('/:id/update-status', protect, authorize('seller'), updateTransactionStatus);

export default router;




