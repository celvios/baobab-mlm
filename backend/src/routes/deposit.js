const express = require('express');
const auth = require('../middleware/auth');
const { submitDepositRequest, upload } = require('../controllers/depositController');

const router = express.Router();

// Submit deposit request
router.post('/request', auth, upload.single('paymentProof'), submitDepositRequest);

module.exports = router;