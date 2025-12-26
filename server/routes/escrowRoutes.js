import express from 'express';
import {
  initiateEscrowPayment,
  confirmEscrowPayment,
  uploadShippingProof,
  confirmDelivery,
  openDispute,
  getMyEscrowTransactions,
} from '../controllers/escrowController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.post('/initiate', protect, authorize('buyer'), initiateEscrowPayment);
router.put('/:transactionId/confirm-payment', protect, authorize('buyer'), confirmEscrowPayment);
router.put('/:transactionId/upload-shipping', protect, authorize('seller'), uploadShippingProof);
router.put('/:transactionId/confirm-delivery', protect, authorize('buyer'), confirmDelivery);
router.put('/:transactionId/dispute', protect, openDispute);
router.get('/my-escrow', protect, getMyEscrowTransactions);

export default router;




