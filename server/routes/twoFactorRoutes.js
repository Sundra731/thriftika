import express from 'express';
import {
  testRoute,
  getTwoFactorStatus,
  setupTwoFactor,
  verifyTwoFactorSetup,
  verifyTwoFactorCode,
  sendTwoFactorCode,
  disableTwoFactor,
  regenerateBackupCodes,
} from '../controllers/twoFactorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route
router.get('/test', testRoute);

// Public routes (for login verification)
router.post('/verify', verifyTwoFactorCode);
router.post('/send-code', sendTwoFactorCode);

// Protected routes
router.use(protect);

router.get('/status', getTwoFactorStatus);
router.post('/setup', setupTwoFactor);
router.post('/verify-setup', verifyTwoFactorSetup);
router.delete('/disable', disableTwoFactor);
router.post('/regenerate-backup-codes', regenerateBackupCodes);

export default router;