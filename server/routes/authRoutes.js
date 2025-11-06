import express from 'express';
import {
  register,
  login,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route working ✅' });
});

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

export default router;

