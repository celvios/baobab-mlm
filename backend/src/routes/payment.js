const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { uploadPaymentProof, confirmPayment, getPendingPayments } = require('../controllers/paymentController');

// User routes
router.post('/upload-proof', auth, uploadPaymentProof);

// Admin routes
router.get('/pending', adminAuth, getPendingPayments);
router.post('/confirm/:userId', adminAuth, confirmPayment);

module.exports = router;