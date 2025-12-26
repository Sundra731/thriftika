import express from 'express';
import {
  testRoute,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route
router.get('/test', testRoute);

// All cart routes require authentication
router.use(protect);

// Cart management routes
router.get('/', getCart);
router.get('/count', getCartCount);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove/:productId', removeFromCart);
router.delete('/clear', clearCart);

export default router;