// server/src/controllers/authController.js
const User = require('../models/User');
const { generateToken } = require('../utils/token');
const { handleValidationErrors } = require('../middleware/validation');
const { body } = require('express-validator');
const emailService = require('../services/emailService');

// Temporary OTP store (in-memory)
// ⚠️ In production, use Redis or DB to store this
const otpStore = {};

// ✅ Validation
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['client', 'freelancer']),
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
];

// ✅ 1️⃣ REGISTER (Send OTP, don't create user yet)
const register = [
  registerValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password, role, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Generate OTP (6 digits)
      const otp = emailService.generateOTP();
      const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Temporarily store OTP & user data
      otpStore[email] = {
        otp,
        otpExpires,
        userData: { email, password, role, firstName, lastName }
      };

      // Send OTP email
      await emailService.sendOTP(email, otp);

      return res.status(200).json({
        success: true,
        message: 'OTP sent to your email. Please verify to complete registration.'
      });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error sending OTP'
      });
    }
  }
];

// ✅ 2️⃣ VERIFY OTP (Then create user)
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = otpStore[email];
    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found for this email. Please register again.'
      });
    }

    // Validate OTP
    if (record.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check expiry
    if (Date.now() > record.otpExpires) {
      delete otpStore[email];
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please register again.'
      });
    }

    const { userData } = record;

    // Create user now that OTP is verified
    const user = new User({
      email: userData.email,
      password: userData.password,
      role: userData.role,
      profile: {
        firstName: userData.firstName,
        lastName: userData.lastName
      },
      isActive: true
    });

    await user.save();

    // Clean up OTP record
    delete otpStore[email];

    // Generate token
    const token = generateToken({ userId: user._id, role: user.role });

    return res.status(201).json({
      success: true,
      message: 'Account created and verified successfully!',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile
        }
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: 'Error verifying OTP' });
  }
};

// ✅ 3️⃣ LOGIN (Only verified users can log in)
const login = [
  loginValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check account status
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Please verify your email before logging in.'
        });
      }

      // Update login info
      user.lastLogin = new Date();
      user.loginCount += 1;
      await user.save();

      const token = generateToken({ userId: user._id, role: user.role });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            profile: user.profile
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Error logging in' });
    }
  }
];

// ✅ 4️⃣ GET PROFILE
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Error fetching user data' });
  }
};

// ✅ Forgot Password - Send Reset OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ success: false, message: 'No user found with this email' });

    // Generate OTP
    const otp = emailService.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // ✅ Correctly assign the object
    user.otp = { code: otp, expiresAt: otpExpires };
    await user.save();

    await emailService.sendOTP(email, otp);

    res.json({
      success: true,
      message: 'Password reset OTP sent to your email.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Error sending reset OTP' });
  }
};

// ✅ Reset Password using OTP
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    // ✅ Validate OTP correctly
    if (!user.otp || user.otp.code !== otp)
      return res.status(400).json({ success: false, message: 'Invalid OTP' });

    if (Date.now() > user.otp.expiresAt)
      return res.status(400).json({ success: false, message: 'OTP expired' });

    // ✅ Update password and clear OTP
    user.password = newPassword;
    user.otp = { code: null, expiresAt: null };
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Error resetting password' });
  }
};

const jwt = require('jsonwebtoken'); // make sure this is installed

const googleLogin = async (req, res) => {
  try {
    const { email, name, uid } = req.body;

    if (!email || !uid) {
      return res.status(400).json({ success: false, message: "Missing email or UID" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not exists
      user = new User({
        email,
        profile: { firstName: name },
        role: 'freelancer', // default role
        firebaseUid: uid,
        isActive: true
      });
      await user.save();
    }

    // Generate token using your existing generateToken function or jwt directly
    const token = generateToken({ userId: user._id, role: user.role });
    // OR if you want to use jwt directly:
    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile
        },
        token
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ success: false, message: 'Error logging in with Google' });
  }
};

module.exports = {
  register,
  verifyOTP,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  googleLogin // ✅ export Google login
};
