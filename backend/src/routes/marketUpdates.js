const express = require('express');
const auth = require('../middleware/auth');
const { getMarketUpdates, markAsRead, getUnreadCount } = require('../controllers/marketUpdatesController');

const router = express.Router();

// Get market updates
router.get('/', auth, getMarketUpdates);

// Mark update as read
router.put('/:updateId/read', auth, markAsRead);

// Get unread count
router.get('/unread-count', auth, getUnreadCount);

module.exports = router;