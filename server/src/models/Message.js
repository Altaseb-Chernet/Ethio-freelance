// server/src/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [{
    filename: String,
    url: String,
    publicId: String,
    fileType: String,
    size: Number
  }],
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ contractId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);