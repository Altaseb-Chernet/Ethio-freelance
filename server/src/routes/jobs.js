// server/src/routes/jobs.js
const express = require('express');
const { createJob, getJobs, getJob, updateJob, acceptBid } = require('../controllers/jobController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

router.get('/', getJobs);
router.get('/:id', getJob);
router.post('/', auth, role('client'), createJob);
router.put('/:id', auth, updateJob);
router.post('/:id/accept-bid', auth, role('client'), acceptBid);

module.exports = router;