// server/src/controllers/authController.js
const User = require('../models/User');
const { generateToken } = require('../utils/token');
const { handleValidationErrors } = require('../middleware/validation');
const { body } = require('express-validator');

// Validation rules
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

const register = [
  registerValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password, role, firstName, lastName } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Create user
      const user = new User({
        email,
        password,
        role,
        profile: { firstName, lastName }
      });

      await user.save();

      // Generate token
      const token = generateToken({ userId: user._id, role: user.role });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
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
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Error registering user'
      });
    }
  }
];

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

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Update login info
      user.lastLogin = new Date();
      user.loginCount += 1;
      await user.save();

      // Generate token
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
      res.status(500).json({
        success: false,
        message: 'Error logging in'
      });
    }
  }
];

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};