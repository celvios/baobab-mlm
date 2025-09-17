const express = require('express');
const auth = require('../middleware/auth');
const { getProfile, updateProfile, getWallet, getTransactionHistory } = require('../controllers/userController');

const router = express.Router();

// Get user profile
router.get('/profile', auth, getProfile);

// Update user profile
router.put('/profile', auth, updateProfile);

// Get wallet info
router.get('/wallet', auth, getWallet);

// Get transaction history
router.get('/transactions', auth, getTransactionHistory);

module.exports = router;