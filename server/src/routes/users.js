// server/src/routes/users.js
const express = require('express');
const { getProfile, updateProfile, searchFreelancers } = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/search/freelancers', searchFreelancers);
router.get('/:id', getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;