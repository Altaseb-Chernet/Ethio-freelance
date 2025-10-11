// server/src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'new_bid', 
      'bid_accepted', 
      'job_funded', 
      'message', 
      'job_completed',
      'payment_received',
      'contract_started',
      'admin_alert'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    bidId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);