// server/src/models/AdminLog.js
const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true
  },
  resourceId: mongoose.Schema.Types.ObjectId,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

module.exports = mongoose.model('AdminLog', adminLogSchema);