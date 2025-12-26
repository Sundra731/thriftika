import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

// Scam keywords to monitor
const SCAM_KEYWORDS = [
  'whatsapp', 'instagram', 'telegram', 'phone number', 'call me',
  'bank transfer', 'western union', 'moneygram', 'paypal',
  'bitcoin', 'crypto', 'escrow bypass', 'meet outside',
  'cash payment', 'direct payment', 'alternative payment'
];

/**
 * @route   GET /api/messages/test
 * @desc    Test messages route
 * @access  Public
 */
export const testRoute = (req, res) => {
  res.json({ message: 'Messages route working ✅' });
};

/**
 * @route   GET /api/messages/conversations
 * @desc    Get all conversations for logged-in user
 * @access  Private
 */
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      $or: [
        { buyer: req.user._id },
        { seller: req.user._id }
      ],
      isActive: true
    })
    .populate('transaction', 'amount status product')
    .populate('buyer', 'name avatar')
    .populate('seller', 'name avatar')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/messages/conversations/:transactionId
 * @desc    Get or create conversation for a transaction
 * @access  Private
 */
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    // Verify transaction exists and user is part of it
    const transaction = await Transaction.findById(transactionId)
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const isBuyer = transaction.buyer._id.toString() === req.user._id.toString();
    const isSeller = transaction.seller._id.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to access this conversation' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({ transaction: transactionId });

    if (!conversation) {
      conversation = await Conversation.create({
        transaction: transactionId,
        buyer: transaction.buyer._id,
        seller: transaction.seller._id,
      });
    }

    // Populate conversation
    await conversation.populate('transaction', 'amount status product');
    await conversation.populate('buyer', 'name avatar');
    await conversation.populate('seller', 'name avatar');
    await conversation.populate('lastMessage');

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/messages/:conversationId
 * @desc    Get messages for a conversation
 * @access  Private
 */
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isBuyer = conversation.buyer.toString() === req.user._id.toString();
    const isSeller = conversation.seller.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to access this conversation' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark messages as read for current user
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Update unread counts
    if (isBuyer) {
      conversation.buyerUnreadCount = 0;
    } else {
      conversation.sellerUnreadCount = 0;
    }
    await conversation.save();

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/messages/:conversationId
 * @desc    Send a message in a conversation
 * @access  Private
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content, attachments } = req.body;

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(conversationId)
      .populate('buyer')
      .populate('seller');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isBuyer = conversation.buyer._id.toString() === req.user._id.toString();
    const isSeller = conversation.seller._id.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to send messages in this conversation' });
    }

    // Check for scam keywords
    const lowerContent = content.toLowerCase();
    const flaggedKeywords = SCAM_KEYWORDS.filter(keyword =>
      lowerContent.includes(keyword.toLowerCase())
    );

    const isFlagged = flaggedKeywords.length > 0;

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
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

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/messages/:messageId/read
 * @desc    Mark message as read
 * @access  Private
 */
export const markMessageAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot mark your own message as read' });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({
      success: true,
      message: 'Message marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/messages/admin/flagged
 * @desc    Get flagged messages (Admin only)
 * @access  Private (Admin)
 */
export const getFlaggedMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ isFlagged: true })
      .populate('conversation')
      .populate('sender', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};