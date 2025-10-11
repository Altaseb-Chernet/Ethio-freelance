// server/src/routes/payments.js
const express = require('express');
const { 
  fundJob, 
  releaseFunds, 
  refundJob, 
  getWallet,
  createStripePayment,
  createChapaPayment
} = require('../controllers/paymentController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/wallet', auth, getWallet);
router.post('/fund-job/:jobId', auth, fundJob);
router.post('/release-funds/:jobId', auth, releaseFunds);
router.post('/refund-job/:jobId', auth, refundJob);
router.post('/stripe/payment', auth, createStripePayment);
router.post('/chapa/payment', auth, createChapaPayment);

module.exports = router;