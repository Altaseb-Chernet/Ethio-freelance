// server/src/controllers/passwordController.js
const User = require('../models/User');
const emailService = require('../services/emailService');

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: 'No user found with that email' });

    // Generate OTP for reset
    const otp = emailService.generateOTP();
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    // ✅ Use sendPasswordReset (not sendOTP)
    await emailService.sendPasswordReset(email, otp);

    res.json({
      success: true,
      message: 'Password reset OTP sent to your email address.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending reset OTP',
    });
  }
};
