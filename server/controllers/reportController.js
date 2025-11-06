import Report from '../models/Report.js';
import User from '../models/User.js';

/**
 * @route   GET /api/reports/test
 * @desc    Test reports route
 * @access  Public
 */
export const testRoute = (req, res) => {
  res.json({ message: 'Reports route working ✅' });
};

/**
 * @route   POST /api/reports
 * @desc    Create a new scam/fraud report (buyer reports seller)
 * @access  Private (Buyer)
 */
export const createReport = async (req, res, next) => {
  try {
    const { reportedSeller, transaction, reason, description, evidence } = req.body;

    // Validate that reported seller exists
    const seller = await User.findById(reportedSeller);
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ message: 'Reported seller not found' });
    }

    // Check if user is trying to report themselves
    if (reportedSeller === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot report yourself' });
    }

    // Determine priority based on reason
    let priority = 'medium';
    if (reason === 'scam' || reason === 'fraudulent-payment') {
      priority = 'urgent';
    } else if (reason === 'item-not-received' || reason === 'fake-product') {
      priority = 'high';
    }

    // Create report
    const report = await Report.create({
      reportedBy: req.user._id,
      reportedSeller,
      transaction,
      reason,
      description,
      evidence: evidence || [],
      priority,
    });

    // Populate references
    await report.populate('reportedBy', 'name email');
    await report.populate('reportedSeller', 'name email');

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our team will review it shortly.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/my-reports
 * @desc    Get all reports submitted by logged-in user
 * @access  Private
 */
export const getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reportedBy: req.user._id })
      .populate('reportedSeller', 'name email')
      .populate('transaction', 'amount status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/:id
 * @desc    Get single report by ID
 * @access  Private
 */
export const getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('reportedSeller', 'name email')
      .populate('transaction', 'amount status paymentStatus')
      .populate('resolvedBy', 'name email');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user is authorized to view this report
    const isReporter = report.reportedBy._id.toString() === req.user._id.toString();
    const isReportedSeller = report.reportedSeller._id.toString() === req.user._id.toString();

    if (!isReporter && !isReportedSeller) {
      return res.status(403).json({ message: 'Not authorized to view this report' });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/all
 * @desc    Get all reports (Admin only - for future implementation)
 * @access  Private (Admin - placeholder)
 */
export const getAllReports = async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const reports = await Report.find(filter)
      .populate('reportedBy', 'name email')
      .populate('reportedSeller', 'name email')
      .populate('transaction', 'amount status')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/reports/:id/resolve
 * @desc    Resolve a report (Admin only - for future implementation)
 * @access  Private (Admin - placeholder)
 */
export const resolveReport = async (req, res, next) => {
  try {
    const { resolution, notes } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Update report status
    report.status = 'resolved';
    report.resolution = resolution || notes;
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    await report.save();

    res.json({
      success: true,
      message: 'Report resolved successfully',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

