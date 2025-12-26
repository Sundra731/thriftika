import express from 'express';
import {
  testRoute,
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markMessageAsRead,
  getFlaggedMessages,
} from '../controllers/messageController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route
router.get('/test', testRoute);

// All routes require authentication
router.use(protect);

// User routes
router.get('/conversations', getConversations);
router.get('/conversations/:transactionId', getOrCreateConversation);
router.get('/:conversationId', getMessages);
router.post('/:conversationId', sendMessage);
router.put('/:messageId/read', markMessageAsRead);

// Admin routes
router.get('/admin/flagged', authorize('admin'), getFlaggedMessages);

export default router;