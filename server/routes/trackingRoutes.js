import express from 'express';
import {
  testRoute,
  updateTrackingInfo,
  addTrackingUpdate,
  getTrackingInfo,
  getCouriers,
} from '../controllers/trackingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/test', testRoute);
router.get('/couriers', getCouriers);

// Protected routes
router.use(protect);

router.put('/:transactionId', updateTrackingInfo);
router.post('/:transactionId/update', addTrackingUpdate);
router.get('/:transactionId', getTrackingInfo);

export default router;