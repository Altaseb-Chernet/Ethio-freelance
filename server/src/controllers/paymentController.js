// server/src/controllers/paymentController.js
const PaymentService = require('../services/paymentService');
const EscrowService = require('../services/escrowService');
const Job = require('../models/Job');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const fundJobValidation = [
  body('amount').isNumeric().isFloat({ min: 1 }).withMessage('Amount must be a positive number'),
  body('paymentMethod').isObject().withMessage('Payment method is required')
];

const fundJob = [
  fundJobValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { jobId } = req.params;
      const { amount, paymentMethod } = req.body;

      const result = await PaymentService.fundJob(jobId, req.user._id, amount, paymentMethod);

      res.json({
        success: true,
        message: result.message,
        data: {
          transactionId: result.transactionId,
          gatewayTransactionId: result.gatewayTransactionId
        }
      });
    } catch (error) {
      console.error('Fund job error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
];

const releaseFunds = async (req, res) => {
  try {
    const { jobId } = req.params;

    const result = await PaymentService.releaseFunds(jobId, req.user._id);

    res.json({
      success: true,
      message: 'Funds released successfully',
      data: {
        amount: result.amount,
        platformFee: result.platformFee,
        transactionId: result.transactionId
      }
    });
  } catch (error) {
    console.error('Release funds error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const refundJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const result = await PaymentService.refundJob(jobId, req.user._id);

    res.json({
      success: true,
      message: result.message,
      data: {
        refundId: result.refundId,
        amount: result.amount
      }
    });
  } catch (error) {
    console.error('Refund job error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('wallet');
    
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        wallet: user.wallet,
        recentTransactions: transactions
      }
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet data'
    });
  }
};

// Integration with real payment providers
const createStripePayment = [
  body('amount').isNumeric().isFloat({ min: 1 }),
  body('currency').isLength({ min: 3, max: 3 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await PaymentService.integrateStripe(req.body);

      res.json({
        success: result.success,
        data: result
      });
    } catch (error) {
      console.error('Stripe payment error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
];

const createChapaPayment = [
  body('amount').isNumeric().isFloat({ min: 1 }),
  body('email').isEmail(),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await PaymentService.integrateChapa(req.body);

      res.json({
        success: result.success,
        data: result
      });
    } catch (error) {
      console.error('Chapa payment error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
];

module.exports = {
  fundJob,
  releaseFunds,
  refundJob,
  getWallet,
  createStripePayment,
  createChapaPayment
};