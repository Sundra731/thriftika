import express from 'express';
import {
  testRoute,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { verifySeller } from '../middleware/verifySellerMiddleware.js';
import { authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route
router.get('/test', testRoute);

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes - Seller only
router.post('/', protect, authorize('seller'), verifySeller, createProduct);
router.get('/seller/my-products', protect, authorize('seller'), getMyProducts);
router.put('/:id', protect, authorize('seller'), updateProduct);
router.delete('/:id', protect, authorize('seller'), deleteProduct);

export default router;

