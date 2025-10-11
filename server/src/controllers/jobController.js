// server/src/controllers/jobController.js
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const Contract = require('../models/Contract');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const createJobValidation = [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('skillsRequired').isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('budget.type').isIn(['fixed', 'hourly']).withMessage('Budget type must be fixed or hourly'),
  body('duration').isIn(['less-than-week', '1-2 weeks', '2-4 weeks', '1-3 months', '3+ months']).withMessage('Invalid duration')
];

const createJob = [
  createJobValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const jobData = {
        ...req.body,
        clientId: req.user._id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      };

      const job = new Job(jobData);
      await job.save();

      // Populate client info
      await job.populate('clientId', 'profile.firstName profile.lastName profile.avatar');

      res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: { job }
      });
    } catch (error) {
      console.error('Create job error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating job'
      });
    }
  }
];

const getJobs = async (req, res) => {
  try {
    const { search, skills, budgetMin, budgetMax, page = 1, limit = 10 } = req.query;
    
    let query = { status: 'open', visibility: 'public' };
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',');
      query.skillsRequired = { $in: skillsArray };
    }
    
    // Budget filter
    if (budgetMin || budgetMax) {
      query.$or = [
        { 'budget.fixed': { $gte: Number(budgetMin) || 0, $lte: Number(budgetMax) || Number.MAX_SAFE_INTEGER } },
        { 'budget.min': { $gte: Number(budgetMin) || 0, $lte: Number(budgetMax) || Number.MAX_SAFE_INTEGER } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const jobs = await Job.find(query)
      .populate('clientId', 'profile.firstName profile.lastName profile.avatar rating.average')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs'
    });
  }
};

const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('clientId', 'profile.firstName profile.lastName profile.avatar rating.average')
      .populate('selectedFreelancer.freelancerId', 'profile.firstName profile.lastName profile.avatar');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Get bids for this job
    const bids = await Bid.find({ jobId: job._id })
      .populate('freelancerId', 'profile.firstName profile.lastName profile.avatar profile.skills profile.hourlyRate rating.average');

    res.json({
      success: true,
      data: { job, bids }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job'
    });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    // Only allow updates to open jobs
    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Can only update open jobs'
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('clientId', 'profile.firstName profile.lastName profile.avatar');

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job'
    });
  }
};

const acceptBid = async (req, res) => {
  try {
    const { bidId } = req.body;
    
    const bid = await Bid.findById(bidId).populate('jobId');
    
    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    const job = bid.jobId;

    // Check ownership
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept bids for this job'
      });
    }

    // Check if job is still open
    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Job is no longer open for bids'
      });
    }

    // Update bid status
    bid.status = 'accepted';
    await bid.save();

    // Update job
    job.status = 'in-progress';
    job.selectedFreelancer = {
      freelancerId: bid.freelancerId,
      bidId: bid._id,
      acceptedAt: new Date()
    };
    await job.save();

    // Create contract
    const contract = new Contract({
      jobId: job._id,
      clientId: job.clientId,
      freelancerId: bid.freelancerId,
      bidId: bid._id,
      terms: {
        price: bid.price,
        estimatedTime: bid.estimatedTime
      },
      platformFee: bid.price * (process.env.PLATFORM_FEE_PERCENTAGE / 100) || 0
    });
    await contract.save();

    // Reject all other bids
    await Bid.updateMany(
      { 
        jobId: job._id, 
        _id: { $ne: bid._id } 
      },
      { status: 'rejected' }
    );

    res.json({
      success: true,
      message: 'Bid accepted successfully',
      data: { contract }
    });
  } catch (error) {
    console.error('Accept bid error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting bid'
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJob,
  updateJob,
  acceptBid
};