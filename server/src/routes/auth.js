const express = require('express');
const {
  register,
  login,
  getMe,
  verifyOTP,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', authLimiter, forgotPassword);  // ✅
router.post('/reset-password', authLimiter, resetPassword);    // ✅
router.get('/me', auth, getMe);

module.exports = router;
