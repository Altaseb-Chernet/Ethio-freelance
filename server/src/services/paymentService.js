// server/src/services/paymentService.js
const Transaction = require('../models/Transaction');
const Job = require('../models/Job');
const User = require('../models/User');

class PaymentService {
  constructor() {
    // In production, initialize real payment gateway here
    this.paymentGateway = this._initializeMockGateway();
  }

  _initializeMockGateway() {
    return {
      processPayment: async (paymentData) => {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock response - 90% success rate
        const success = Math.random() > 0.1;
        
        return {
          success,
          transactionId: success ? `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null,
          message: success ? 'Payment processed successfully' : 'Payment failed - mock decline',
          gateway: 'mock'
        };
      },
      
      refundPayment: async (transactionId, amount) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return {
          success: true,
          refundId: `mock_refund_${Date.now()}`,
          message: 'Refund processed successfully'
        };
      }
    };
  }

  // Fund a job (move money to escrow)
  async fundJob(jobId, clientId, amount, paymentMethod) {
    try {
      // Verify job exists and belongs to client
      const job = await Job.findById(jobId);
      if (!job || job.clientId.toString() !== clientId.toString()) {
        throw new Error('Job not found or access denied');
      }

      // Process payment through gateway
      const paymentResult = await this.paymentGateway.processPayment({
        amount,
        currency: 'USD',
        paymentMethod,
        description: `Funding for job: ${job.title}`
      });

      if (!paymentResult.success) {
        throw new Error(`Payment failed: ${paymentResult.message}`);
      }

      // Create transaction record
      const transaction = new Transaction({
        userId: clientId,
        type: 'escrow_hold',
        amount: -amount, // Negative for outgoing
        description: `Escrow hold for job: ${job.title}`,
        metadata: {
          jobId: job._id,
          paymentGatewayId: paymentResult.transactionId
        },
        status: 'completed'
      });
      await transaction.save();

      // Update job escrow status
      job.escrow.funded = true;
      job.escrow.amount = amount;
      await job.save();

      // Update client wallet
      await User.findByIdAndUpdate(clientId, {
        $inc: { 'wallet.totalSpent': amount }
      });

      return {
        success: true,
        transactionId: transaction._id,
        gatewayTransactionId: paymentResult.transactionId,
        message: 'Job funded successfully'
      };
    } catch (error) {
      console.error('Fund job error:', error);
      throw error;
    }
  }

  // Release funds to freelancer
  async releaseFunds(jobId, clientId) {
    try {
      const job = await Job.findById(jobId).populate('selectedFreelancer.freelancerId');
      
      if (!job || job.clientId.toString() !== clientId.toString()) {
        throw new Error('Job not found or access denied');
      }

      if (!job.escrow.funded || job.escrow.released) {
        throw new Error('Escrow not funded or already released');
      }

      const freelancerId = job.selectedFreelancer.freelancerId._id;
      const amount = job.escrow.amount;
      const platformFee = amount * (process.env.PLATFORM_FEE_PERCENTAGE / 100) || 0;
      const freelancerAmount = amount - platformFee;

      // Create transactions
      const releaseTransaction = new Transaction({
        userId: freelancerId,
        type: 'escrow_release',
        amount: freelancerAmount,
        description: `Payment release for job: ${job.title}`,
        metadata: {
          jobId: job._id,
          platformFee: platformFee
        },
        status: 'completed'
      });

      const feeTransaction = new Transaction({
        userId: freelancerId, // Platform user ID in real implementation
        type: 'fee',
        amount: platformFee,
        description: `Platform fee for job: ${job.title}`,
        metadata: {
          jobId: job._id
        },
        status: 'completed'
      });

      await releaseTransaction.save();
      await feeTransaction.save();

      // Update job and escrow
      job.escrow.released = true;
      job.status = 'completed';
      job.completion.completedAt = new Date();
      await job.save();

      // Update freelancer wallet
      await User.findByIdAndUpdate(freelancerId, {
        $inc: { 
          'wallet.balance': freelancerAmount,
          'wallet.totalEarned': freelancerAmount
        }
      });

      return {
        success: true,
        amount: freelancerAmount,
        platformFee,
        transactionId: releaseTransaction._id
      };
    } catch (error) {
      console.error('Release funds error:', error);
      throw error;
    }
  }

  // Refund escrow to client
  async refundJob(jobId, clientId) {
    try {
      const job = await Job.findById(jobId);
      
      if (!job || job.clientId.toString() !== clientId.toString()) {
        throw new Error('Job not found or access denied');
      }

      if (!job.escrow.funded || job.escrow.released) {
        throw new Error('Escrow not funded or already released');
      }

      const amount = job.escrow.amount;

      // Process refund through gateway
      const refundResult = await this.paymentGateway.refundPayment(
        `mock_tx_for_${jobId}`, // In real implementation, store actual gateway transaction ID
        amount
      );

      if (!refundResult.success) {
        throw new Error(`Refund failed: ${refundResult.message}`);
      }

      // Create refund transaction
      const refundTransaction = new Transaction({
        userId: clientId,
        type: 'refund',
        amount: amount,
        description: `Refund for job: ${job.title}`,
        metadata: {
          jobId: job._id,
          paymentGatewayId: refundResult.refundId
        },
        status: 'completed'
      });
      await refundTransaction.save();

      // Update job and escrow
      job.escrow.funded = false;
      job.escrow.amount = 0;
      job.status = 'cancelled';
      await job.save();

      // Update client wallet
      await User.findByIdAndUpdate(clientId, {
        $inc: { 
          'wallet.balance': amount,
          'wallet.totalSpent': -amount
        }
      });

      return {
        success: true,
        refundId: refundTransaction._id,
        amount,
        message: 'Refund processed successfully'
      };
    } catch (error) {
      console.error('Refund job error:', error);
      throw error;
    }
  }

  // Integrate with real payment provider (example for Stripe)
  async integrateStripe(paymentData) {
    /*
    // Example Stripe integration:
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: paymentData.amount * 100, // Convert to cents
        currency: paymentData.currency || 'usd',
        payment_method: paymentData.paymentMethodId,
        confirm: true,
        return_url: paymentData.returnUrl
      });

      return {
        success: paymentIntent.status === 'succeeded',
        transactionId: paymentIntent.id,
        message: `Payment ${paymentIntent.status}`
      };
    } catch (error) {
      throw new Error(`Stripe error: ${error.message}`);
    }
    */
    
    // For now, return mock
    return this.paymentGateway.processPayment(paymentData);
  }

  // Integrate with Chapa (Ethiopian payment gateway)
  async integrateChapa(paymentData) {
    /*
    // Example Chapa integration:
    const chapa = require('chapa')(process.env.CHAPA_SECRET_KEY);
    
    try {
      const response = await chapa.initialize({
        amount: paymentData.amount,
        currency: 'ETB',
        email: paymentData.email,
        first_name: paymentData.firstName,
        last_name: paymentData.lastName,
        tx_ref: `tx_${Date.now()}`,
        callback_url: paymentData.callbackUrl,
        return_url: paymentData.returnUrl
      });

      return {
        success: response.status === 'success',
        checkoutUrl: response.data.checkout_url,
        transactionId: response.data.tx_ref,
        message: response.message
      };
    } catch (error) {
      throw new Error(`Chapa error: ${error.message}`);
    }
    */
    
    // For now, return mock
    return this.paymentGateway.processPayment(paymentData);
  }
}

module.exports = new PaymentService();