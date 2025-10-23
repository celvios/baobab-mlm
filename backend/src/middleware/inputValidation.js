const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  return value.replace(/[<>]/g, '').trim();
};

const validateRegistration = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must be 8+ chars with uppercase, lowercase, and number'),
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name required'),
  body('phone').optional().matches(/^\+?[1-9]\d{1,14}$/).withMessage('Valid phone number required'),
  handleValidationErrors
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  handleValidationErrors
];

const validateWithdrawal = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount required'),
  handleValidationErrors
];

const validateUserId = [
  param('id').isInt({ min: 1 }).withMessage('Valid user ID required'),
  handleValidationErrors
];

const validateEmail = [
  param('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  handleValidationErrors
];

const validateOrderStatus = [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  handleValidationErrors
];

const validateAmount = [
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount required'),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateWithdrawal,
  validateUserId,
  validateEmail,
  validateOrderStatus,
  validateAmount,
  handleValidationErrors,
  sanitizeInput
};
