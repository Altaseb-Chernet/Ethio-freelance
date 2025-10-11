// server/src/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  }
});

// AI endpoints rate limiter
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each user to 10 AI requests per minute
  message: {
    success: false,
    message: 'Too many AI requests, please wait a moment.'
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  aiLimiter
};