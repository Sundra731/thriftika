import express from 'express';
import {
  testRoute,
  createReport,
  getMyReports,
  getReport,
  getAllReports,
  resolveReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route
router.get('/test', testRoute);

// Buyer routes
router.post('/', protect, authorize('buyer'), createReport);
router.get('/my-reports', protect, getMyReports);
router.get('/:id', protect, getReport);

// Admin routes (placeholder - add admin role check in future)
router.get('/all', protect, getAllReports);
router.put('/:id/resolve', protect, resolveReport);

export default router;




