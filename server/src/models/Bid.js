// server/src/models/Bid.js
const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  proposal: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  estimatedTime: {
    value: Number,
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks', 'months'],
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  enhancements: {
    aiEnhanced: { type: Boolean, default: false },
    originalProposal: String,
    confidenceScore: Number
  },
  attachments: [{
    filename: String,
    url: String,
    publicId: String
  }]
}, {
  timestamps: true
});

// Ensure one bid per freelancer per job
bidSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });

module.exports = mongoose.model('Bid', bidSchema);