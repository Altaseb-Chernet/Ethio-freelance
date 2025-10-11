// server/src/controllers/userController.js
const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email')
      .populate('rating.reviews.clientId', 'profile.firstName profile.lastName');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove protected fields
    delete updates.email;
    delete updates.password;
    delete updates.role;
    delete updates.wallet;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

const searchFreelancers = async (req, res) => {
  try {
    const { search, skills, minRate, maxRate, page = 1, limit = 10 } = req.query;
    
    let query = { role: 'freelancer', isActive: true };
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',');
      query['profile.skills'] = { $in: skillsArray };
    }
    
    // Rate filter
    if (minRate || maxRate) {
      query['profile.hourlyRate'] = {};
      if (minRate) query['profile.hourlyRate'].$gte = Number(minRate);
      if (maxRate) query['profile.hourlyRate'].$lte = Number(maxRate);
    }

    const skip = (page - 1) * limit;
    
    const freelancers = await User.find(query)
      .select('-password -email')
      .sort({ 'rating.average': -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        freelancers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Search freelancers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching freelancers'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  searchFreelancers
};