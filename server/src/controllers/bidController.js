// server/src/controllers/bidController.js
const Bid = require('../models/Bid');
const Job = require('../models/Job');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const createBidValidation = [
  body('proposal').trim().isLength({ min: 20 }).withMessage('Proposal must be at least 20 characters'),
  body('price').isNumeric().isFloat({ min: 1 }).withMessage('Price must be a positive number'),
  body('estimatedTime.value').isNumeric().isInt({ min: 1 }).withMessage('Estimated time value must be a positive integer'),
  body('estimatedTime.unit').isIn(['hours', 'days', 'weeks', 'months']).withMessage('Invalid time unit')
];

const createBid = [
  createBidValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { jobId } = req.params;
      const bidData = {
        ...req.body,
        jobId,
        freelancerId: req.user._id
      };

      // Check if job exists and is open
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      if (job.status !== 'open') {
        return res.status(400).json({
          success: false,
          message: 'Job is no longer accepting bids'
        });
      }

      // Check if user has already bid on this job
      const existingBid = await Bid.findOne({ jobId, freelancerId: req.user._id });
      if (existingBid) {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted a bid for this job'
        });
      }

      const bid = new Bid(bidData);
      await bid.save();

      // Populate freelancer info
      await bid.populate('freelancerId', 'profile.firstName profile.lastName profile.avatar profile.skills rating.average');

      res.status(201).json({
        success: true,
        message: 'Bid submitted successfully',
        data: { bid }
      });
    } catch (error) {
      console.error('Create bid error:', error);
      res.status(500).json({
        success: false,
        message: 'Error submitting bid'
      });
    }
  }
];

const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user._id })
      .populate('jobId', 'title description budget status clientId')
      .populate('jobId.clientId', 'profile.firstName profile.lastName profile.avatar rating.average')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { bids }
    });
  } catch (error) {
    console.error('Get my bids error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bids'
    });
  }
};

const updateBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    
    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    // Check ownership
    if (bid.freelancerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this bid'
      });
    }

    // Only allow updates to pending bids
    if (bid.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only update pending bids'
      });
    }

    const updatedBid = await Bid.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('freelancerId', 'profile.firstName profile.lastName profile.avatar profile.skills rating.average');

    res.json({
      success: true,
      message: 'Bid updated successfully',
      data: { bid: updatedBid }
    });
  } catch (error) {
    console.error('Update bid error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bid'
    });
  }
};

module.exports = {
  createBid,
  getMyBids,
  updateBid
};