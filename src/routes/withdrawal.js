const express = require('express');
const auth = require('../middleware/auth');
const { requestWithdrawal, getWithdrawalRequests } = require('../controllers/withdrawalController');

const router = express.Router();

// Request withdrawal
router.post('/request', auth, requestWithdrawal);

// Get withdrawal requests
router.get('/requests', auth, getWithdrawalRequests);

module.exports = router;