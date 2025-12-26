import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailUtils.js';

/**
 * @route   GET /api/2fa/test
 * @desc    Test 2FA route
 * @access  Public
 */
export const testRoute = (req, res) => {
  res.json({ message: '2FA route working ✅' });
};

/**
 * @route   GET /api/2fa/status
 * @desc    Get 2FA status for current user
 * @access  Private
 */
export const getTwoFactorStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('twoFactorEnabled twoFactorMethod twoFactorVerified');

    res.json({
      success: true,
      data: {
        enabled: user.twoFactorEnabled,
        method: user.twoFactorMethod,
        verified: user.twoFactorVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/2fa/setup
 * @desc    Setup 2FA for current user
 * @access  Private
 */
export const setupTwoFactor = async (req, res, next) => {
  try {
    const { method } = req.body;

    if (!['email', 'sms', 'authenticator'].includes(method)) {
      return res.status(400).json({ message: 'Invalid 2FA method' });
    }

    const user = await User.findById(req.user._id);

    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is already enabled' });
    }

    user.twoFactorMethod = method;

    if (method === 'authenticator') {
      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `Thriftika (${user.email})`,
        issuer: 'Thriftika',
      });

      user.twoFactorTempSecret = secret.base32;

      // Generate QR code
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

      res.json({
        success: true,
        message: 'Scan the QR code with your authenticator app',
        data: {
          secret: secret.base32,
          qrCodeUrl,
          method,
        },
      });
    } else {
      // For email/SMS, generate backup codes
      const backupCodes = [];
      for (let i = 0; i < 10; i++) {
        backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
      }

      user.twoFactorBackupCodes = backupCodes;

      res.json({
        success: true,
        message: '2FA setup initiated. Please verify with a code.',
        data: {
          method,
          backupCodes: method === 'email' ? backupCodes : undefined, // Only show backup codes for email
        },
      });
    }

    await user.save();
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/2fa/verify-setup
 * @desc    Verify 2FA setup
 * @access  Private
 */
export const verifyTwoFactorSetup = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id);

    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is already enabled' });
    }

    let isValid = false;

    if (user.twoFactorMethod === 'authenticator') {
      // Verify TOTP code
      isValid = speakeasy.totp.verify({
        secret: user.twoFactorTempSecret,
        encoding: 'base32',
        token: code,
        window: 2, // Allow 2 time windows (30 seconds each)
      });

      if (isValid) {
        user.twoFactorSecret = user.twoFactorTempSecret;
        user.twoFactorTempSecret = undefined;

        // Generate backup codes
        const backupCodes = [];
        for (let i = 0; i < 10; i++) {
          backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
        }
        user.twoFactorBackupCodes = backupCodes;
      }
    } else if (user.twoFactorMethod === 'email') {
      // For email, send verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Store code temporarily (in production, use Redis or similar)
      user.twoFactorTempSecret = verificationCode;

      // Send email
      await sendEmail({
        to: user.email,
        subject: 'Thriftika 2FA Verification Code',
        html: `
          <h2>Verify Your 2FA Setup</h2>
          <p>Your verification code is: <strong>${verificationCode}</strong></p>
          <p>This code will expire in 10 minutes.</p>
        `,
      });

      return res.json({
        success: true,
        message: 'Verification code sent to your email',
      });
    }

    if (isValid || user.twoFactorMethod === 'email') {
      user.twoFactorEnabled = true;
      user.twoFactorVerified = true;
      await user.save();

      res.json({
        success: true,
        message: '2FA enabled successfully',
        data: {
          backupCodes: user.twoFactorBackupCodes,
        },
      });
    } else {
      res.status(400).json({ message: 'Invalid verification code' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/2fa/verify
 * @desc    Verify 2FA code during login
 * @access  Public (but requires temp token)
 */
export const verifyTwoFactorCode = async (req, res, next) => {
  try {
    const { code, userId } = req.body;

    const user = await User.findById(userId);

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA not enabled for this user' });
    }

    let isValid = false;

    if (user.twoFactorMethod === 'authenticator') {
      // Verify TOTP
      isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 2,
      });
    } else if (user.twoFactorMethod === 'email') {
      // Check if code matches temp secret (from email verification)
      isValid = user.twoFactorTempSecret === code;
      if (isValid) {
        user.twoFactorTempSecret = undefined; // Clear temp code
      }
    }

    // Check backup codes
    if (!isValid && user.twoFactorBackupCodes.includes(code)) {
      isValid = true;
      // Remove used backup code
      user.twoFactorBackupCodes = user.twoFactorBackupCodes.filter(c => c !== code);
    }

    if (isValid) {
      user.twoFactorVerified = true;
      await user.save();

      res.json({
        success: true,
        message: '2FA verification successful',
      });
    } else {
      res.status(400).json({ message: 'Invalid 2FA code' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/2fa/send-code
 * @desc    Send 2FA code for login
 * @access  Public
 */
export const sendTwoFactorCode = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA not enabled for this user' });
    }

    if (user.twoFactorMethod === 'email') {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Store code temporarily
      user.twoFactorTempSecret = verificationCode;

      // Send email
      await sendEmail({
        to: user.email,
        subject: 'Thriftika Login Verification Code',
        html: `
          <h2>Login Verification Code</h2>
          <p>Your verification code is: <strong>${verificationCode}</strong></p>
          <p>This code will expire in 10 minutes.</p>
        `,
      });

      await user.save();

      res.json({
        success: true,
        message: 'Verification code sent to your email',
      });
    } else {
      res.status(400).json({ message: 'Code sending not supported for this 2FA method' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/2fa/disable
 * @desc    Disable 2FA for current user
 * @access  Private
 */
export const disableTwoFactor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    user.twoFactorEnabled = false;
    user.twoFactorMethod = 'email';
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = [];
    user.twoFactorTempSecret = undefined;
    user.twoFactorVerified = false;

    await user.save();

    res.json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/2fa/regenerate-backup-codes
 * @desc    Regenerate backup codes
 * @access  Private
 */
export const regenerateBackupCodes = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }

    user.twoFactorBackupCodes = backupCodes;
    await user.save();

    res.json({
      success: true,
      message: 'Backup codes regenerated',
      data: {
        backupCodes,
      },
    });
  } catch (error) {
    next(error);
  }
};