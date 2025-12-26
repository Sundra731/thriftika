import Verification from '../models/Verification.js';
import User from '../models/User.js';
import { sendVerificationStatusEmail } from '../utils/emailUtils.js';

/**
 * Helper function to calculate profile completeness
 */
const calculateProfileCompleteness = (user, verification) => {
  let score = 0;
  const maxScore = 100;

  // Basic info (30 points)
  if (user.name) score += 10;
  if (user.email) score += 10;
  if (user.phone) score += 10;

  // Address (20 points)
  if (user.address) {
    if (user.address.street) score += 5;
    if (user.address.city) score += 5;
    if (user.address.country) score += 5;
    if (user.address.postalCode) score += 5;
  }

  // Verification (50 points)
  if (verification) {
    if (verification.phoneVerified) score += 10;
    if (verification.selfieWithId) score += 20;
    if (verification.idFrontImage) score += 10;
    if (verification.idNumber) score += 10;
  }

  return Math.min(score, maxScore);
};

/**
 * @route   GET /api/verify/test
 * @desc    Test verification route
 * @access  Public
 */
export const testRoute = (req, res) => {
  res.json({ message: 'Verification route working ✅' });
};

/**
 * @route   POST /api/verify/submit
 * @desc    Submit seller verification documents
 * @access  Private (Seller)
 */
export const submitVerification = async (req, res, next) => {
  try {
    // Check if user is a seller
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can submit verification' });
    }

    // Check if verification already exists
    const existingVerification = await Verification.findOne({ seller: req.user._id });

    if (existingVerification && existingVerification.status === 'approved') {
      return res.status(400).json({ message: 'Seller is already verified' });
    }

    const {
      phoneNumber, // For phone verification
      selfieWithId, // Selfie holding ID - REQUIRED
      idType,
      idNumber,
      idFrontImage,
      idBackImage,
      businessLicense,
      additionalDocuments,
    } = req.body;

    // Validate required fields for enhanced verification
    if (!selfieWithId) {
      return res.status(400).json({ message: 'Selfie with ID is required for verification' });
    }

    // Update user's phone if provided
    if (phoneNumber) {
      await User.findByIdAndUpdate(req.user._id, { phone: phoneNumber });
    }

    // Create or update verification
    let verification;
    if (existingVerification) {
      verification = await Verification.findByIdAndUpdate(
        existingVerification._id,
        {
          selfieWithId,
          idType,
          idNumber,
          idFrontImage,
          idBackImage,
          businessLicense,
          additionalDocuments: additionalDocuments || [],
          status: 'pending',
        },
        { new: true, runValidators: true }
      );
    } else {
      verification = await Verification.create({
        seller: req.user._id,
        selfieWithId,
        idType,
        idNumber,
        idFrontImage,
        idBackImage,
        businessLicense,
        additionalDocuments: additionalDocuments || [],
      });
    }

    // Calculate profile completeness
    const user = await User.findById(req.user._id);
    const completeness = calculateProfileCompleteness(user, verification);
    await User.findByIdAndUpdate(req.user._id, { profileCompleteness: completeness });

    res.status(201).json({
      success: true,
      message: 'Verification documents submitted successfully',
      data: verification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/verify/status
 * @desc    Get current user's verification status
 * @access  Private (Seller)
 */
export const getVerificationStatus = async (req, res, next) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can check verification status' });
    }

    const verification = await Verification.findOne({ seller: req.user._id });

    if (!verification) {
      return res.json({
        success: true,
        data: {
          status: 'not-submitted',
          message: 'No verification documents submitted yet',
        },
      });
    }

    res.json({
      success: true,
      data: verification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/verify/all
 * @desc    Get all pending verifications (Admin only - for future implementation)
 * @access  Private (Admin - placeholder)
 */
export const getAllVerifications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const verifications = await Verification.find(filter)
      .populate('seller', 'name email role')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: verifications.length,
      data: verifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/verify/:id/approve
 * @desc    Approve seller verification (Admin only - for future implementation)
 * @access  Private (Admin - placeholder)
 */
export const approveVerification = async (req, res, next) => {
  try {
    const verification = await Verification.findById(req.params.id);

    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    if (verification.status === 'approved') {
      return res.status(400).json({ message: 'Verification already approved' });
    }

    // Update verification status
    verification.status = 'approved';
    verification.reviewedBy = req.user._id;
    verification.reviewedAt = new Date();
    verification.reviewNotes = req.body.notes || 'Approved';
    await verification.save();

    // Update user verification status and mark phone/selfie as verified
    const seller = await User.findByIdAndUpdate(
      verification.seller,
      {
        isVerified: true,
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
        selfieVerified: true,
        selfieImage: verification.selfieWithId,
        selfieVerifiedAt: new Date(),
      },
      { new: true }
    );

    // Send notification email
    try {
      await sendVerificationStatusEmail(seller.email, 'approved');
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Seller verification approved',
      data: verification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/verify/:id/reject
 * @desc    Reject seller verification (Admin only - for future implementation)
 * @access  Private (Admin - placeholder)
 */
export const rejectVerification = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const verification = await Verification.findById(req.params.id);

    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    // Update verification status
    verification.status = 'rejected';
    verification.reviewedBy = req.user._id;
    verification.reviewedAt = new Date();
    verification.reviewNotes = reason || 'Rejected';
    await verification.save();

    // Ensure user verification status is false
    const seller = await User.findByIdAndUpdate(verification.seller, { isVerified: false }, { new: true });

    // Send notification email
    try {
      await sendVerificationStatusEmail(seller.email, 'rejected');
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Seller verification rejected',
      data: verification,
    });
  } catch (error) {
    next(error);
  }
};






