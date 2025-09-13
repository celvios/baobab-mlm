const express = require('express');
const { body } = require('express-validator');
const { adminLogin, adminLogout, getAdminProfile } = require('../controllers/adminController');
const { getDashboardStats } = require('../controllers/adminDashboardController');
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/adminProductController');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Admin login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], adminLogin);

// Admin logout (protected)
router.post('/logout', adminAuth, adminLogout);

// Get admin profile (protected)
router.get('/profile', adminAuth, getAdminProfile);

// Dashboard stats (protected)
router.get('/dashboard/stats', adminAuth, getDashboardStats);

// Product management (protected)
router.get('/products', adminAuth, getProducts);
router.post('/products', adminAuth, [
  body('name').trim().isLength({ min: 1 }),
  body('price').isNumeric(),
  body('category').trim().isLength({ min: 1 }),
  body('stock').isInt({ min: 0 })
], createProduct);
router.put('/products/:id', adminAuth, updateProduct);
router.delete('/products/:id', adminAuth, deleteProduct);

module.exports = router;