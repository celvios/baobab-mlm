const express = require('express');
const { body } = require('express-validator');
const { register, login, verifyEmail, resendVerification, verifyOTP } = require('../controllers/authController');

const router = express.Router();

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').trim().isLength({ min: 2 }),
  body('phone').trim().isLength({ min: 10 })
], register);

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], login);

// Verify email
router.get('/verify-email', verifyEmail);

// Resend verification
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail()
], resendVerification);

// Verify OTP
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 })
], verifyOTP);

module.exports = router;