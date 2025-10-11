const express = require('express');
const { createBid, getMyBids, updateBid } = require('../controllers/bidController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

router.get('/my-bids', auth, role('freelancer'), getMyBids);
router.post('/:jobId', auth, role('freelancer'), createBid);
router.put('/:id', auth, role('freelancer'), updateBid);

module.exports = router;