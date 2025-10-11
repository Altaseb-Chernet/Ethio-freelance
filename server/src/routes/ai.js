// server/src/routes/ai.js
const express = require('express');
const { enhanceProposal, matchJob, suggestPrice } = require('../controllers/aiController');
const auth = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/enhance-proposal', auth, aiLimiter, enhanceProposal);
router.get('/match-job/:jobId', auth, matchJob);
router.post('/suggest-price', auth, aiLimiter, suggestPrice);

module.exports = router;