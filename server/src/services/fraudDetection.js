// server/src/services/fraudDetection.js
const User = require('../models/User');
const Job = require('../models/Job');
const Bid = require('../models/Bid');

class FraudDetectionService {
  constructor() {
    this.suspiciousPatterns = [];
  }

  // Analyze user for suspicious activity
  async analyzeUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const analysis = {
        userId: user._id,
        riskScore: 0,
        flags: [],
        recommendations: []
      };

      // Check 1: Multiple accounts from same IP (simplified)
      const sameIPUsers = await User.countDocuments({ 
        lastLoginIP: user.lastLoginIP,
        _id: { $ne: user._id }
      });
      
      if (sameIPUsers > 2) {
        analysis.riskScore += 30;
        analysis.flags.push('Multiple accounts from same IP');
      }

      // Check 2: Too many recent bids
      const recentBids = await Bid.countDocuments({
        freelancerId: userId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });
      
      if (recentBids > 10) {
        analysis.riskScore += 20;
        analysis.flags.push('High bid frequency detected');
      }

      // Check 3: Unusually low bids
      const lowBids = await Bid.find({
        freelancerId: userId,
        price: { $lt: 10 } // Bids less than $10
      });
      
      if (lowBids.length > 5) {
        analysis.riskScore += 25;
        analysis.flags.push('Multiple unusually low bids');
      }

      // Check 4: New user with high activity
      const userAge = Date.now() - user.createdAt;
      const isNewUser = userAge < 7 * 24 * 60 * 60 * 1000; // Less than 7 days
      
      if (isNewUser && (user.loginCount > 20 || recentBids > 15)) {
        analysis.riskScore += 15;
        analysis.flags.push('New user with unusually high activity');
      }

      // Determine risk level
      if (analysis.riskScore >= 50) {
        analysis.riskLevel = 'HIGH';
        analysis.recommendations.push('Consider temporary suspension');
        analysis.recommendations.push('Require identity verification');
      } else if (analysis.riskScore >= 30) {
        analysis.riskLevel = 'MEDIUM';
        analysis.recommendations.push('Monitor user activity closely');
        analysis.recommendations.push('Consider additional verification');
      } else {
        analysis.riskLevel = 'LOW';
      }

      // Update user flag if high risk
      if (analysis.riskLevel === 'HIGH' && !user.isFlagged) {
        user.isFlagged = true;
        user.flagReason = `Automated flag: ${analysis.flags.join(', ')}`;
        await user.save();
      }

      return analysis;
    } catch (error) {
      console.error('Fraud analysis error:', error);
      throw error;
    }
  }

  // Detect bid manipulation patterns
  async detectBidManipulation(jobId) {
    try {
      const job = await Job.findById(jobId);
      const bids = await Bid.find({ jobId }).populate('freelancerId');

      const analysis = {
        jobId,
        suspiciousBids: [],
        patterns: []
      };

      // Check for bid collusion (similar bids from same IP/pattern)
      const bidGroups = {};
      
      bids.forEach(bid => {
        const key = `${bid.price}_${bid.estimatedTime.value}`;
        if (!bidGroups[key]) {
          bidGroups[key] = [];
        }
        bidGroups[key].push(bid);
      });

      // Flag groups with identical bids
      Object.entries(bidGroups).forEach(([pattern, groupBids]) => {
        if (groupBids.length > 2) {
          analysis.patterns.push(`Multiple identical bids: ${pattern}`);
          analysis.suspiciousBids.push(...groupBids.map(b => b._id));
        }
      });

      return analysis;
    } catch (error) {
      console.error('Bid manipulation detection error:', error);
      throw error;
    }
  }

  // Monitor transaction patterns
  async analyzeTransactionPatterns(userId) {
    // This would integrate with transaction data
    // For now, return basic analysis
    return {
      userId,
      totalTransactions: 0,
      chargebackRate: 0,
      suspiciousPatterns: [],
      riskLevel: 'LOW'
    };
  }

  // Manual review trigger
  async triggerManualReview(userId, reason) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          isFlagged: true,
          flagReason: `Manual review: ${reason}`,
          isActive: false // Suspend during review
        },
        { new: true }
      );

      // Log review action
      console.log(`Manual review triggered for user ${userId}: ${reason}`);

      return {
        success: true,
        user,
        reviewRequired: true
      };
    } catch (error) {
      console.error('Trigger manual review error:', error);
      throw error;
    }
  }
}

module.exports = new FraudDetectionService();