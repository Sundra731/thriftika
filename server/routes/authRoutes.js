import express from 'express';
import {
  register,
  login,
  verifyTwoFactorLogin,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { generateToken } from '../utils/tokenUtils.js';
import passport from '../utils/passport.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route working ✅' });
});

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verifyTwoFactorLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Google OAuth routes - check if strategy is available at request time
// Helper function to check if Google OAuth is properly configured
const checkGoogleOAuth = () => {
  const hasCredentials = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
  if (!hasCredentials) {
    return { enabled: false, reason: 'Missing credentials' };
  }
  
  // Check if strategy is registered in passport
  try {
    const hasStrategy = passport._strategies && passport._strategies.google !== undefined;
    if (!hasStrategy) {
      return { enabled: false, reason: 'Strategy not registered' };
    }
    return { enabled: true };
  } catch (error) {
    return { enabled: false, reason: 'Error checking strategy' };
  }
};

router.get('/google', (req, res, next) => {
  const oauthCheck = checkGoogleOAuth();
  if (!oauthCheck.enabled) {
    return res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables and restart the server.'
    });
  }
  // Only call passport.authenticate if strategy is available
  try {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: 'Google OAuth is not available. Please configure it and restart the server.'
    });
  }
});

router.get('/google/callback', (req, res, next) => {
  const oauthCheck = checkGoogleOAuth();
  if (!oauthCheck.enabled) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/login?error=google_oauth_not_configured`);
  }
  
  try {
    passport.authenticate('google', { 
      failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed` 
    })(req, res, (err) => {
      if (err) {
        return next(err);
      }
      // Generate JWT token for the authenticated user
      const token = generateToken(req.user._id);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      // Redirect to frontend with token
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified
      }))}`);
    });
  } catch (error) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/login?error=google_oauth_error`);
  }
});

// Protected routes
router.get('/me', protect, getMe);

export default router;






