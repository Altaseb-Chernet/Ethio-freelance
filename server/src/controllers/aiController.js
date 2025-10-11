// server/src/controllers/aiController.js
const AIService = require('../services/aiService');
const Job = require('../models/Job');
const User = require('../models/User');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const enhanceProposalValidation = [
  body('proposal').trim().isLength({ min: 10 }).withMessage('Proposal must be at least 10 characters'),
  body('jobDescription').trim().isLength({ min: 10 }).withMessage('Job description must be at least 10 characters')
];

const enhanceProposal = [
  enhanceProposalValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { proposal, jobDescription } = req.body;

      const result = await AIService.enhanceProposal(proposal, jobDescription);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Enhance proposal error:', error);
      res.status(500).json({
        success: false,
        message: 'Error enhancing proposal'
      });
    }
  }
];

const matchJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Get all active freelancers
    const freelancers = await User.find({ 
      role: 'freelancer', 
      isActive: true 
    }).select('-password');

    const matches = await AIService.matchJobToFreelancers(job, freelancers);

    // Return top 10 matches
    const topMatches = matches.slice(0, 10);

    res.json({
      success: true,
      data: {
        job,
        matches: topMatches,
        totalMatches: matches.length
      }
    });
  } catch (error) {
    console.error('Match job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error matching job to freelancers'
    });
  }
};

const suggestPrice = [
  body('budget').isObject().withMessage('Budget object is required'),
  body('duration').isIn(['less-than-week', '1-2 weeks', '2-4 weeks', '1-3 months', '3+ months']).withMessage('Invalid duration'),
  body('skillsRequired').isArray().withMessage('Skills must be an array'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const jobDetails = req.body;

      const suggestion = await AIService.suggestPrice(jobDetails);

      res.json({
        success: true,
        data: suggestion
      });
    } catch (error) {
      console.error('Suggest price error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating price suggestion'
      });
    }
  }
];

module.exports = {
  enhanceProposal,
  matchJob,
  suggestPrice
};