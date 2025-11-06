import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorMiddleware.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Thriftika server running on port ${PORT}`);
});

