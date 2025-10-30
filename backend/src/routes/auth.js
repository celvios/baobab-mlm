const express = require('express');
const { body } = require('express-validator');
const { register, login, verifyEmail, resendVerification, verifyOTP, forgotPassword, resetPassword } = require('../controllers/authController');
const { csrfProtection, generateCsrfToken } = require('../middleware/csrf');
const { validateRegistration, validateLogin, handleValidationErrors } = require('../middleware/inputValidation');

const router = express.Router();

router.get('/csrf-token', generateCsrfToken, (req, res) => {
  res.json({ csrfToken: res.locals.csrfToken });
});

// Register (CSRF disabled for launch - re-enable after testing)
router.post('/register', validateRegistration, register);

// Login (CSRF disabled for launch - re-enable after testing)
router.post('/login', validateLogin, login);

// Verify email
router.get('/verify-email', verifyEmail);

// Resend verification (CSRF disabled - user not authenticated yet)
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail(),
  handleValidationErrors
], resendVerification);

// Verify OTP (CSRF disabled - user not authenticated yet)
router.post('/verify-otp', [
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