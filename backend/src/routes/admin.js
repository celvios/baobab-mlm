const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const adminAuth = require('../middleware/adminAuth');

// Admin dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [usersResult, ordersResult, revenueResult, withdrawalsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users WHERE role != $1', ['admin']),
      pool.query('SELECT COUNT(*) as count FROM orders'),
      pool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = $1', ['completed']),
      pool.query('SELECT COUNT(*) as count FROM withdrawal_requests WHERE status = $1', ['pending'])
    ]);

    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      totalOrders: parseInt(ordersResult.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].total),
      pendingWithdrawals: parseInt(withdrawalsResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Recent activity
router.get('/recent-activity', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        'New user registered: ' || full_name as description,
        created_at
      FROM users 
      WHERE role != 'admin'
      UNION ALL
      SELECT 
        'New order placed: #' || id as description,
        created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json({
      activities: result.rows
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;