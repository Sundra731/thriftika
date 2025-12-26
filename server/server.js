import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorMiddleware.js';
import { setupEscrowAutoRelease } from './utils/escrowAutoRelease.js';
import Message from './models/Message.js';
import Conversation from './models/Conversation.js';

// Load environment variables FIRST
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
}

// Import passport AFTER environment variables are loaded
import passport from './utils/passport.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import escrowRoutes from './routes/escrowRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import disputeRoutes from './routes/disputeRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import twoFactorRoutes from './routes/twoFactorRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

// Initialize Express app
const app = express();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.FRONTEND_URL
      ].filter(Boolean);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Configure multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Make upload available to routes
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// Connect to MongoDB
connectDB();

// Set up escrow auto-release (Security measure #5)
setupEscrowAutoRelease();

// Base API route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Thriftika API 🚀' });
});

// Mount route files
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/2fa', twoFactorRoutes);
app.use('/api/cart', cartRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room for notifications
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Join conversation room
  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave-conversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`User left conversation ${conversationId}`);
  });

  // Handle sending messages
  socket.on('send-message', async (data) => {
    try {
      const { conversationId, content, attachments, userId } = data;

      // Verify conversation access (simplified - in production, add proper auth)
      const conversation = await Conversation.findById(conversationId)
        .populate('buyer')
        .populate('seller');

      if (!conversation) return;

      const isBuyer = conversation.buyer._id.toString() === userId;
      const isSeller = conversation.seller._id.toString() === userId;

      if (!isBuyer && !isSeller) return;

      // Create message (reuse logic from controller)
      const SCAM_KEYWORDS = [
        'whatsapp', 'instagram', 'telegram', 'phone number', 'call me',
        'bank transfer', 'western union', 'moneygram', 'paypal',
        'bitcoin', 'crypto', 'escrow bypass', 'meet outside',
        'cash payment', 'direct payment', 'alternative payment'
      ];

      const lowerContent = content.toLowerCase();
      const flaggedKeywords = SCAM_KEYWORDS.filter(keyword =>
        lowerContent.includes(keyword.toLowerCase())
      );

      const isFlagged = flaggedKeywords.length > 0;

      const message = await Message.create({
        conversation: conversationId,
        sender: userId,
        content,
        attachments: attachments || [],
        flaggedKeywords,
        isFlagged,
        flaggedReason: isFlagged ? 'Contains potentially suspicious keywords' : null,
      });

      // Update conversation
      conversation.lastMessage = message._id;
      conversation.lastMessageAt = new Date();

      // Increment unread count for the other user
      if (isBuyer) {
        conversation.sellerUnreadCount += 1;
      } else {
        conversation.buyerUnreadCount += 1;
      }

      await conversation.save();

      // Populate message
      await message.populate('sender', 'name avatar');

      // Emit to conversation room
      io.to(conversationId).emit('new-message', message);

      // Notify the other user
      const otherUserId = isBuyer ? conversation.seller._id.toString() : conversation.buyer._id.toString();
      io.to(otherUserId).emit('message-notification', {
        conversationId,
        message,
        sender: message.sender,
      });

    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Thriftika server running on port ${PORT}`);
});

