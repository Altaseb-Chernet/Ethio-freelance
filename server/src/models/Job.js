// server/src/models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillsRequired: [String],
  budget: {
    type: {
      type: String,
      enum: ['fixed', 'hourly'],
      required: true
    },
    min: Number,
    max: Number,
    fixed: Number
  },
  duration: {
    type: String,
    enum: ['less-than-week', '1-2 weeks', '2-4 weeks', '1-3 months', '3+ months'],
    required: true
  },
  attachments: [{
    filename: String,
    url: String,
    publicId: String
  }],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  escrow: {
    funded: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    released: { type: Boolean, default: false }
  },
  selectedFreelancer: {
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bidId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
    acceptedAt: Date
  },
  completion: {
    completedAt: Date,
    clientRating: Number,
    clientReview: String
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  expiresAt: Date
}, {
  timestamps: true
});

// Index for search
jobSchema.index({ title: 'text', description: 'text', skillsRequired: 'text' });

// Expire jobs after 30 days
jobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Job', jobSchema);