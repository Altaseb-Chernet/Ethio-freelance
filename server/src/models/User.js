// server/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['client', 'freelancer', 'admin'],
    required: true
  },
    otp: {
    code: String,
    expiresAt: Date
  },
  
  resetToken: {
    token: String,
    expiresAt: Date
  },
  
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
    skills: [String],
    hourlyRate: Number,
    portfolio: [{
      title: String,
      description: String,
      url: String,
      fileUrl: String
    }],
    experience: String,
    education: String,
    avatar: String
  },
  wallet: {
    balance: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 }
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    reviews: [{
      clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: Number,
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }]
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isFlagged: { type: Boolean, default: false },
  flagReason: String,
  lastLogin: Date,
  loginCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Index for search
userSchema.index({ 
  'profile.firstName': 'text', 
  'profile.lastName': 'text', 
  'profile.bio': 'text', 
  'profile.skills': 'text' 
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update rating method
userSchema.methods.updateRating = function(newRating, comment, clientId) {
  this.rating.reviews.push({ clientId, rating: newRating, comment });
  this.rating.average = (
    (this.rating.average * this.rating.count + newRating) / 
    (this.rating.count + 1)
  );
  this.rating.count += 1;
};

module.exports = mongoose.model('User', userSchema);