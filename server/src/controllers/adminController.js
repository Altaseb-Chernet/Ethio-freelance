// server/src/controllers/adminController.js
const User = require('../models/User');
const Job = require('../models/Job');
const Contract = require('../models/Contract');
const Transaction = require('../models/Transaction');
const FraudDetectionService = require('../services/fraudDetection');

const getDashboard = async (req, res) => {
  try {
    // Basic platform statistics
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalContracts = await Contract.countDocuments();
    const totalRevenue = await Transaction.aggregate([
      { $match: { type: 'fee', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('email role profile.firstName profile.lastName createdAt isActive');

    const recentJobs = await Job.find()
      .populate('clientId', 'profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalJobs,
          totalContracts,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        recentUsers,
        recentJobs
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    
    let query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (role) {
      query.role = role;
    }

    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove protected fields
    delete updates.password;
    delete updates.email;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
};

const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        isFlagged: true,
        flagReason: `Banned by admin: ${reason}`
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User banned successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error banning user'
    });
  }
};

const unbanUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { 
        isActive: true,
        isFlagged: false,
        flagReason: null
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User unbanned successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unbanning user'
    });
  }
};

const analyzeFraud = async (req, res) => {
  try {
    const { userId } = req.params;

    const analysis = await FraudDetectionService.analyzeUser(userId);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Fraud analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing user for fraud'
    });
  }
};

const getFlaggedUsers = async (req, res) => {
  try {
    const flaggedUsers = await User.find({ isFlagged: true })
      .select('-password')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: { flaggedUsers }
    });
  } catch (error) {
    console.error('Get flagged users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flagged users'
    });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  updateUser,
  banUser,
  unbanUser,
  analyzeFraud,
  getFlaggedUsers
};