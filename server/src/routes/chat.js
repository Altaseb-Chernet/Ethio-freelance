// server/src/routes/chat.js
const express = require('express');
const { getMessages, sendMessage, getContracts } = require('../controllers/chatController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/contracts', auth, getContracts);
router.get('/messages/:contractId', auth, getMessages);
router.post('/messages/:contractId', auth, sendMessage);

module.exports = router;