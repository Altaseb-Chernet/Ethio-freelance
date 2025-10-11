// server/src/routes/admin.js
const express = require('express');
const { 
  getDashboard, 
  getUsers, 
  updateUser, 
  banUser, 
  unbanUser,
  analyzeFraud,
  getFlaggedUsers
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// All admin routes require admin role
router.use(auth, role('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.post('/users/:id/ban', banUser);
router.post('/users/:id/unban', unbanUser);
router.get('/fraud/analyze/:userId', analyzeFraud);
router.get('/fraud/flagged', getFlaggedUsers);

module.exports = router;