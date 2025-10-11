// server/src/models/Contract.js
const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    required: true
  },
  terms: {
    price: Number,
    estimatedTime: {
      value: Number,
      unit: String
    },
    milestones: [{
      title: String,
      amount: Number,
      dueDate: Date,
      completed: { type: Boolean, default: false }
    }]
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'disputed'],
    default: 'active'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  platformFee: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contract', contractSchema);