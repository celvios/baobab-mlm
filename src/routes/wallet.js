const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { purchaseWithWallet } = require('../controllers/walletController');

router.post('/purchase', auth, purchaseWithWallet);

module.exports = router;