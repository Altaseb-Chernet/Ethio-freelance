// server/src/services/escrowService.js
const Job = require('../models/Job');
const Contract = require('../models/Contract');
const Transaction = require('../models/Transaction');

class EscrowService {
  // Create escrow agreement
  async createEscrow(jobId, amount, terms) {
    try {
      const job = await Job.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      // Update job with escrow info
      job.escrow = {
        funded: false,
        amount: amount,
        released: false,
        terms: terms
      };

      await job.save();

      return {
        success: true,
        escrowId: job._id,
        amount,
        terms
      };
    } catch (error) {
      console.error('Create escrow error:', error);
      throw error;
    }
  }

  // Verify escrow conditions
  async verifyEscrowConditions(jobId) {
    try {
      const job = await Job.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      const contract = await Contract.findOne({ jobId });
      if (!contract) {
        throw new Error('Contract not found');
      }

      const conditions = {
        isFunded: job.escrow.funded,
        isActive: contract.status === 'active',
        isCompleted: job.status === 'completed',
        hasDispute: contract.status === 'disputed',
        milestonesCompleted: contract.terms.milestones
          ? contract.terms.milestones.every(m => m.completed)
          : true
      };

      return {
        conditions,
        canRelease: conditions.isFunded && 
                   conditions.isActive && 
                   !conditions.hasDispute &&
                   conditions.milestonesCompleted
      };
    } catch (error) {
      console.error('Verify escrow conditions error:', error);
      throw error;
    }
  }

  // Automatic release based on conditions
  async autoReleaseIfConditionsMet(jobId) {
    try {
      const verification = await this.verifyEscrowConditions(jobId);
      
      if (verification.canRelease) {
        // In real implementation, call payment service to release funds
        console.log(`Auto-release conditions met for job ${jobId}`);
        return {
          autoReleased: true,
          conditions: verification.conditions
        };
      }

      return {
        autoReleased: false,
        conditions: verification.conditions
      };
    } catch (error) {
      console.error('Auto release error:', error);
      throw error;
    }
  }

  // Create milestone-based escrow
  async createMilestoneEscrow(jobId, milestones) {
    try {
      const job = await Job.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      const totalAmount = milestones.reduce((sum, milestone) => sum + milestone.amount, 0);

      // Update contract with milestones
      await Contract.findOneAndUpdate(
        { jobId },
        { 
          $set: { 
            'terms.milestones': milestones,
            'terms.price': totalAmount
          } 
        }
      );

      // Update job escrow
      job.escrow.amount = totalAmount;
      await job.save();

      return {
        success: true,
        totalAmount,
        milestones: milestones.length
      };
    } catch (error) {
      console.error('Create milestone escrow error:', error);
      throw error;
    }
  }

  // Release milestone payment
  async releaseMilestone(jobId, milestoneIndex) {
    try {
      const contract = await Contract.findOne({ jobId });
      if (!contract) {
        throw new Error('Contract not found');
      }

      if (!contract.terms.milestones || !contract.terms.milestones[milestoneIndex]) {
        throw new Error('Milestone not found');
      }

      const milestone = contract.terms.milestones[milestoneIndex];
      
      if (milestone.completed) {
        throw new Error('Milestone already completed');
      }

      // Mark milestone as completed
      contract.terms.milestones[milestoneIndex].completed = true;
      await contract.save();

      // In real implementation, release the milestone amount
      console.log(`Milestone ${milestoneIndex} released: $${milestone.amount}`);

      return {
        success: true,
        milestone: contract.terms.milestones[milestoneIndex],
        amount: milestone.amount
      };
    } catch (error) {
      console.error('Release milestone error:', error);
      throw error;
    }
  }
}

module.exports = new EscrowService();