const express = require('express');
const { body } = require('express-validator');
const { adminLogin, adminLogout, getAdminProfile } = require('../controllers/adminController');
const { getDashboardStats } = require('../controllers/adminDashboardController');
const { getProducts, createProduct, updateProduct, deleteProduct, getProductCategories, getProductStats } = require('../controllers/adminProductController');
const { getUsers, getUserDetails, createUser, updateUser, deactivateUser } = require('../controllers/adminUserController');
const pool = require('../config/database');
const { getOrders, updateOrderStatus, getOrderStats, bulkUpdateOrders } = require('../controllers/adminOrderController');
const { getWithdrawals, updateWithdrawalStatus, bulkApproveWithdrawals, getWithdrawalStats } = require('../controllers/adminWithdrawalController');
const { getStages, getStageStats } = require('../controllers/adminStagesController');

const { getEmailList, sendEmail, getEmailHistory, removeUserFromList } = require('../controllers/adminEmailController');
const { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, toggleAnnouncementStatus, getAnnouncementStats } = require('../controllers/adminAnnouncementController');
const { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, publishBlogPost, getBlogStats } = require('../controllers/adminBlogController');
const { updateAdminProfile, updateBusinessDetails, updateAccountDetails, getPickupStations, createPickupStation, updatePickupStation, deletePickupStation, changePassword } = require('../controllers/adminSettingsController');
const { uploadImage, uploadImages, deleteFile, getFiles } = require('../controllers/adminUploadController');
const { getSalesReport, getUserAnalytics, getCommissionReport, exportData } = require('../controllers/adminReportsController');
const { getNotifications, markAsRead, markAllAsRead, deleteNotification, getNotificationSettings, updateNotificationSettings } = require('../controllers/adminNotificationController');
const { getActivityLogs, getSystemLogs, getSecurityEvents, getAuditStats } = require('../controllers/adminAuditController');
const { getPaymentGateways, updatePaymentGateway, getEmailServices, updateEmailService, testEmailService, getSystemHealth, optimizeDatabase } = require('../controllers/adminIntegrationController');
const adminAuth = require('../middleware/adminAuth');
const { apiLimiter, authLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

// Admin login
router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], adminLogin);

// Admin logout (protected)
router.post('/logout', adminAuth, adminLogout);

// Get admin profile (protected)
router.get('/profile', adminAuth, getAdminProfile);

// Dashboard stats (protected)
router.get('/dashboard/stats', adminAuth, cacheMiddleware(300), getDashboardStats);

// User management (protected)
router.get('/users', adminAuth, getUsers);
router.get('/users/:id', adminAuth, getUserDetails);
router.post('/users', adminAuth, [
  body('full_name').trim().isLength({ min: 1 }),
  body('email').isEmail().normalizeEmail(),
  body('phone').trim().isLength({ min: 1 }),
  body('password').isLength({ min: 6 })
], createUser);
router.put('/users/:id', adminAuth, updateUser);
router.delete('/users/:id', adminAuth, deactivateUser);

// Product management (protected)
router.get('/products', adminAuth, getProducts);
router.get('/products/stats', adminAuth, getProductStats);
router.get('/products/categories', adminAuth, getProductCategories);
router.post('/products', adminAuth, [
  body('name').trim().isLength({ min: 1 }),
  body('price').isNumeric(),
  body('category').trim().isLength({ min: 1 }),
  body('stock').isInt({ min: 0 })
], createProduct);
router.put('/products/:id', adminAuth, updateProduct);
router.delete('/products/:id', adminAuth, deleteProduct);

// Order management (protected)
router.get('/orders', adminAuth, getOrders);
router.get('/orders/stats', adminAuth, getOrderStats);
router.put('/orders/:id', adminAuth, updateOrderStatus);
router.put('/orders/bulk-update', adminAuth, bulkUpdateOrders);

// Withdrawal management (protected)
router.get('/withdrawals', adminAuth, getWithdrawals);
router.get('/withdrawals/stats', adminAuth, getWithdrawalStats);
router.put('/withdrawals/:id', adminAuth, updateWithdrawalStatus);
router.put('/withdrawals/bulk-approve', adminAuth, bulkApproveWithdrawals);

// Deposit requests management (protected)
router.get('/deposit-requests', adminAuth, async (req, res) => {
  try {
    const result = await require('../config/database').query(`
      SELECT 
        pc.id, pc.user_id, pc.amount, pc.proof_url, pc.created_at,
        u.full_name, u.email
      FROM payment_confirmations pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.status = 'pending' AND pc.type = 'deposit'
      ORDER BY pc.created_at DESC
    `);
    res.json({ depositRequests: result.rows });
  } catch (error) {
    console.error('Get deposit requests error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.post('/approve-deposit', adminAuth, async (req, res) => {
  try {
    const { requestId, userId, amount } = req.body;
    const pool = require('../config/database');
    
    // Credit user wallet
    await pool.query(
      'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2',
      [amount, userId]
    );
    
    // Create transaction record
    await pool.query(
      'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [userId, 'credit', amount, 'Wallet deposit approved']
    );
    
    // Update payment confirmation status
    await pool.query(
      'UPDATE payment_confirmations SET status = $1, confirmed_by = $2, confirmed_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['confirmed', req.admin.id, requestId]
    );
    
    res.json({ message: 'Deposit approved successfully' });
  } catch (error) {
    console.error('Approve deposit error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.post('/reject-deposit', adminAuth, async (req, res) => {
  try {
    const { requestId } = req.body;
    const pool = require('../config/database');
    
    // Update payment confirmation status
    await pool.query(
      'UPDATE payment_confirmations SET status = $1, confirmed_by = $2, confirmed_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['rejected', req.admin.id, requestId]
    );
    
    res.json({ message: 'Deposit rejected' });
  } catch (error) {
    console.error('Reject deposit error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});



// MLM Stages & Rewards (read-only)
router.get('/stages', adminAuth, getStages);
router.get('/stages/stats', adminAuth, getStageStats);

// Email Management (protected)
router.get('/emails', adminAuth, getEmailList);
router.get('/emails/history', adminAuth, getEmailHistory);
router.post('/emails/send', adminAuth, [
  body('subject').trim().isLength({ min: 1 }),
  body('message').trim().isLength({ min: 1 })
], sendEmail);
router.delete('/emails/users/:id', adminAuth, removeUserFromList);

// Announcements (protected)
router.get('/announcements', adminAuth, getAnnouncements);
router.get('/announcements/stats', adminAuth, getAnnouncementStats);
router.post('/announcements', adminAuth, [
  body('title').trim().isLength({ min: 1 }),
  body('message').trim().isLength({ min: 1 }),
  body('type').trim().isLength({ min: 1 }),
  body('priority').trim().isLength({ min: 1 })
], createAnnouncement);
router.put('/announcements/:id', adminAuth, updateAnnouncement);
router.put('/announcements/:id/toggle', adminAuth, toggleAnnouncementStatus);
router.delete('/announcements/:id', adminAuth, deleteAnnouncement);

// Blog Management (protected)
router.get('/blog', adminAuth, getBlogPosts);
router.get('/blog/stats', adminAuth, getBlogStats);
router.post('/blog', adminAuth, [
  body('title').trim().isLength({ min: 1 }),
  body('content').trim().isLength({ min: 1 })
], createBlogPost);
router.put('/blog/:id', adminAuth, updateBlogPost);
router.put('/blog/:id/publish', adminAuth, publishBlogPost);
router.delete('/blog/:id', adminAuth, deleteBlogPost);

// Settings (protected)
router.put('/settings/profile', adminAuth, updateAdminProfile);
router.put('/settings/business', adminAuth, updateBusinessDetails);
router.put('/settings/account', adminAuth, updateAccountDetails);
router.put('/settings/password', adminAuth, [
  body('old_password').exists(),
  body('new_password').isLength({ min: 6 })
], changePassword);

// Pickup Stations (protected)
router.get('/settings/pickup-stations', adminAuth, getPickupStations);
router.post('/settings/pickup-stations', adminAuth, [
  body('name').trim().isLength({ min: 1 }),
  body('address').trim().isLength({ min: 1 }),
  body('phone').trim().isLength({ min: 1 })
], createPickupStation);
router.put('/settings/pickup-stations/:id', adminAuth, updatePickupStation);
router.delete('/settings/pickup-stations/:id', adminAuth, deletePickupStation);

// File Upload (protected)
router.post('/upload/image', adminAuth, uploadLimiter, uploadImage);
router.post('/upload/images', adminAuth, uploadLimiter, uploadImages);
router.get('/upload/files', adminAuth, getFiles);
router.delete('/upload/files/:filename', adminAuth, deleteFile);

// Reports & Analytics (protected)
router.get('/reports/sales', adminAuth, getSalesReport);
router.get('/reports/users', adminAuth, getUserAnalytics);
router.get('/reports/commissions', adminAuth, getCommissionReport);
router.get('/reports/export', adminAuth, exportData);

// Notifications (protected)
router.get('/notifications', adminAuth, getNotifications);
router.put('/notifications/:id/read', adminAuth, markAsRead);
router.put('/notifications/mark-all-read', adminAuth, markAllAsRead);
router.delete('/notifications/:id', adminAuth, deleteNotification);
router.get('/notifications/settings', adminAuth, getNotificationSettings);
router.put('/notifications/settings', adminAuth, updateNotificationSettings);

// Audit & Logging (protected)
router.get('/audit/activities', adminAuth, getActivityLogs);
router.get('/audit/system-logs', adminAuth, getSystemLogs);
router.get('/audit/security-events', adminAuth, getSecurityEvents);
router.get('/audit/stats', adminAuth, getAuditStats);

// System Integration (protected)
router.get('/integrations/payment-gateways', adminAuth, getPaymentGateways);
router.put('/integrations/payment-gateways/:id', adminAuth, updatePaymentGateway);
router.get('/integrations/email-services', adminAuth, getEmailServices);
router.put('/integrations/email-services/:id', adminAuth, updateEmailService);
router.post('/integrations/test-email', adminAuth, testEmailService);
router.get('/system/health', adminAuth, getSystemHealth);
router.post('/system/optimize', adminAuth, optimizeDatabase);

module.exports = router;