// server/src/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'escrow_hold', 'escrow_release', 'refund', 'fee'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  description: String,
  metadata: {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
    paymentGatewayId: String,
    platformFee: Number
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  completedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);