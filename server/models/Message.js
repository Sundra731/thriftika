import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'system'],
      default: 'text',
    },
    attachments: [
      {
        type: String, // URLs to images or files
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    // Scam detection
    flaggedKeywords: [
      {
        type: String,
      },
    ],
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flaggedReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ isFlagged: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;