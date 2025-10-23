const express = require('express');
const { body } = require('express-validator');
const { register, login, verifyEmail, resendVerification, verifyOTP, forgotPassword, resetPassword } = require('../controllers/authController');
const { csrfProtection, generateCsrfToken } = require('../middleware/csrf');
const { validateRegistration, validateLogin, handleValidationErrors } = require('../middleware/inputValidation');

const router = express.Router();

router.get('/csrf-token', generateCsrfToken, (req, res) => {
  res.json({ csrfToken: res.locals.csrfToken });
});

// Register
router.post('/register', csrfProtection, validateRegistration, register);

// Login
router.post('/login', csrfProtection, validateLogin, login);

// Verify email
router.get('/verify-email', verifyEmail);

// Resend verification
router.post('/resend-verification', csrfProtection, [
  body('email').isEmail().normalizeEmail(),
  handleValidationErrors
], resendVerification);

// Verify OTP
router.post('/verify-otp', csrfProtection, [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }),
  handleValidationErrors
], verifyOTP);

// Forgot password
router.post('/forgot-password', csrfProtection, [
  body('email').isEmail().normalizeEmail(),
  handleValidationErrors
], forgotPassword);

// Reset password
router.post('/reset-password', csrfProtection, [
  body('token').exists(),
  body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  handleValidationErrors
], resetPassword);

module.exports = router;