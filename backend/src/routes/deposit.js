const express = require('express');
const auth = require('../middleware/auth');
const { submitDepositRequest, getDepositStatus, upload } = require('../controllers/depositController');

const router = express.Router();

router.post('/request', auth, upload.single('paymentProof'), submitDepositRequest);
router.get('/status', auth, getDepositStatus);

module.exports = router;