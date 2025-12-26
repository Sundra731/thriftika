import express from 'express';
import {
  testRoute,
  createDispute,
  getMyDisputes,
  getDispute,
  addDisputeResponse,
  getAllDisputes,
  resolveDispute,
} from '../controllers/disputeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route
router.get('/test', testRoute);

// All routes require authentication
router.use(protect);

// User routes
router.post('/', createDispute);
router.get('/my-disputes', getMyDisputes);
router.get('/:id', getDispute);
router.put('/:id/response', addDisputeResponse);

// Admin routes
router.get('/admin/all', authorize('admin'), getAllDisputes);
router.put('/:id/resolve', authorize('admin'), resolveDispute);

export default router;