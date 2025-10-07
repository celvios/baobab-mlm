const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const adminAuth = require('../middleware/adminAuth');
const { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, publishBlogPost, getBlogStats } = require('../../../src/controllers/adminBlogController');

// Admin dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [usersResult, ordersResult, revenueResult, withdrawalsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users WHERE role != $1', ['admin']),
      pool.query('SELECT COUNT(*) as count FROM orders'),
      pool.query(`
        SELECT 
          COALESCE(SUM(COALESCE(balance, 0)), 0) + 
          COALESCE(SUM(COALESCE(total_earned, 0)), 0) as total
        FROM wallets
      `),
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

// Debug revenue endpoint
router.get('/debug-revenue', async (req, res) => {
  try {
    const [walletsCount, walletsData, usersCount] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM wallets'),
      pool.query('SELECT SUM(COALESCE(balance, 0)) as total_balance, SUM(COALESCE(total_earned, 0)) as total_earned FROM wallets'),
      pool.query('SELECT COUNT(*) as count FROM users WHERE role != $1', ['admin'])
    ]);
    
    res.json({
      walletsCount: walletsCount.rows[0].count,
      usersCount: usersCount.rows[0].count,
      totalBalance: walletsData.rows[0].total_balance,
      totalEarned: walletsData.rows[0].total_earned,
      calculatedRevenue: (parseFloat(walletsData.rows[0].total_balance) || 0) + (parseFloat(walletsData.rows[0].total_earned) || 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint without auth
router.get('/test-stats', async (req, res) => {
  try {
    const [usersResult, ordersResult, revenueResult, withdrawalsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users WHERE role != $1', ['admin']),
      pool.query('SELECT COUNT(*) as count FROM orders'),
      pool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE order_status = $1', ['completed']),
      pool.query('SELECT COUNT(*) as count FROM withdrawal_requests WHERE status = $1', ['pending'])
    ]);

    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      totalOrders: parseInt(ordersResult.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].total),
      pendingWithdrawals: parseInt(withdrawalsResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching test stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test users endpoint with hardcoded data
router.get('/users-test', async (req, res) => {
  try {
    // First try to get real data
    const result = await pool.query(`
      SELECT u.*, w.balance, w.total_earned
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE u.role != 'admin' OR u.role IS NULL
      ORDER BY u.created_at DESC
    `);
    
    if (result.rows.length > 0) {
      res.json({ users: result.rows });
    } else {
      // Return hardcoded test data if no real users
      res.json({
        users: [
          {
            id: 1,
            full_name: 'John Doe',
            email: 'john@example.com',
            phone: '+234123456789',
            is_active: true,
            balance: 25000,
            total_earned: 50000,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            full_name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+234987654321',
            is_active: true,
            balance: 15000,
            total_earned: 30000,
            created_at: new Date().toISOString()
          }
        ]
      });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    // Return hardcoded data on error too
    res.json({
      users: [
        {
          id: 1,
          full_name: 'Test User',
          email: 'test@example.com',
          phone: '+234000000000',
          is_active: true,
          balance: 10000,
          total_earned: 20000,
          created_at: new Date().toISOString()
        }
      ]
    });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.*, w.balance, w.total_earned
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE u.role != 'admin'
      ORDER BY u.created_at DESC
    `);
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user
router.post('/users', adminAuth, async (req, res) => {
  const { fullName, email, phone, password, creditAmount } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const userResult = await client.query(
      'INSERT INTO users (full_name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [fullName, email, phone, hashedPassword]
    );
    
    const user = userResult.rows[0];
    
    // Create wallet
    await client.query(
      'INSERT INTO wallets (user_id, balance, total_earned) VALUES ($1, $2, $3)',
      [user.id, creditAmount || 0, creditAmount || 0]
    );
    
    // Create transaction if credit amount provided
    if (creditAmount && creditAmount > 0) {
      await client.query(
        'INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5)',
        [user.id, 'credit', creditAmount, 'Admin credit', 'completed']
      );
    }
    
    await client.query('COMMIT');
    res.json({ message: 'User created successfully', user });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Credit user (test version without auth)
router.post('/users/:userId/credit-test', async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update wallet
    await client.query(
      'UPDATE wallets SET balance = balance + $1, total_earned = total_earned + $1 WHERE user_id = $2',
      [amount, userId]
    );
    
    // Create transaction
    await client.query(
      'INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'credit', amount, 'Admin credit', 'completed']
    );
    
    await client.query('COMMIT');
    res.json({ message: 'User credited successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error crediting user:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Credit user with notification
router.post('/users/:userId/credit-with-notification', async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get user info
    const userResult = await client.query('SELECT full_name FROM users WHERE id = $1', [userId]);
    const userName = userResult.rows[0]?.full_name || 'User';
    
    // Update wallet
    await client.query(
      'UPDATE wallets SET balance = balance + $1, total_earned = total_earned + $1 WHERE user_id = $2',
      [amount, userId]
    );
    
    // Create transaction
    await client.query(
      'INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'credit', amount, 'Admin credit', 'completed']
    );
    
    // Create market update for user
    await client.query(
      'INSERT INTO market_updates (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
      [userId, 'Account Credited', `Your account has been credited with $${amount.toLocaleString()}. Your new balance is now available for use.`, 'credit']
    );
    
    await client.query('COMMIT');
    res.json({ message: 'User credited successfully with notification' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error crediting user with notification:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Credit user
router.post('/users/:userId/credit', adminAuth, async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update wallet
    await client.query(
      'UPDATE wallets SET balance = balance + $1, total_earned = total_earned + $1 WHERE user_id = $2',
      [amount, userId]
    );
    
    // Create transaction
    await client.query(
      'INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'credit', amount, 'Admin credit', 'completed']
    );
    
    await client.query('COMMIT');
    res.json({ message: 'User credited successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error crediting user:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Get all orders for admin
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.full_name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status
router.put('/orders/:orderId', adminAuth, async (req, res) => {
  const { orderId } = req.params;
  const updateData = req.body;
  
  try {
    const setClause = Object.keys(updateData).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [orderId, ...Object.values(updateData)];
    
    await pool.query(
      `UPDATE orders SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      values
    );
    
    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products for admin
router.get('/products', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM products
      ORDER BY created_at DESC
    `);
    res.json({ products: result.rows });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new product
router.post('/products', adminAuth, async (req, res) => {
  const { name, description, price, category, stock_quantity, image_url } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price, category, stock, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, price, category, stock_quantity || 0, image_url]
    );
    
    res.json({ message: 'Product created successfully', product: result.rows[0] });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/products/:productId', adminAuth, async (req, res) => {
  const { productId } = req.params;
  const { name, description, price, category, stock_quantity, image_url } = req.body;
  
  try {
    await pool.query(
      'UPDATE products SET name = $1, description = $2, price = $3, category = $4, stock = $5, image_url = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7',
      [name, description, price, category, stock_quantity, image_url, productId]
    );
    
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/products/:productId', adminAuth, async (req, res) => {
  const { productId } = req.params;
  
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
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
        'Credited ' || u.full_name || ': ₦' || t.amount::text as description,
        t.created_at
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.type = 'credit' AND t.description = 'Admin credit'
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

// Deposit management routes
router.get('/deposit-requests', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT dr.*, u.full_name as user_name, u.email as user_email
      FROM deposit_requests dr
      LEFT JOIN users u ON dr.user_id = u.id
      ORDER BY dr.created_at DESC
    `);
    res.json({ deposits: result.rows });
  } catch (error) {
    console.error('Error fetching deposit requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/approve-deposit', adminAuth, async (req, res) => {
  const { depositId, amount } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get deposit request
    const depositResult = await client.query('SELECT * FROM deposit_requests WHERE id = $1', [depositId]);
    const deposit = depositResult.rows[0];
    
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit request not found' });
    }
    
    // Update wallet
    await client.query(
      'UPDATE wallets SET balance = balance + $1, total_earned = total_earned + $1 WHERE user_id = $2',
      [amount, deposit.user_id]
    );
    
    // Create transaction
    await client.query(
      'INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5)',
      [deposit.user_id, 'deposit', amount, 'Deposit approved by admin', 'completed']
    );
    
    // Update deposit status
    await client.query(
      'UPDATE deposit_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['approved', depositId]
    );
    
    await client.query('COMMIT');
    res.json({ message: 'Deposit approved and user credited successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error approving deposit:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

router.post('/reject-deposit', adminAuth, async (req, res) => {
  const { depositId } = req.body;
  
  try {
    await pool.query(
      'UPDATE deposit_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['rejected', depositId]
    );
    
    res.json({ message: 'Deposit rejected successfully' });
  } catch (error) {
    console.error('Error rejecting deposit:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Withdrawal management routes
router.get('/withdrawals', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT wr.*, u.full_name, u.email, up.bank_name, up.account_number, up.account_name
      FROM withdrawal_requests wr
      LEFT JOIN users u ON wr.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      ORDER BY wr.created_at DESC
    `);
    
    const formattedRequests = result.rows.map(row => ({
      id: row.id,
      amount: parseFloat(row.amount),
      status: row.status,
      createdAt: row.created_at,
      user: {
        fullName: row.full_name,
        email: row.email
      },
      bankDetails: {
        bankName: row.bank_name,
        accountNumber: row.account_number,
        accountName: row.account_name
      }
    }));
    
    res.json({ requests: formattedRequests });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/withdrawals/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get withdrawal details
    const withdrawalResult = await client.query(
      'SELECT * FROM withdrawal_requests WHERE id = $1',
      [id]
    );
    
    if (withdrawalResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Withdrawal not found' });
    }
    
    const withdrawal = withdrawalResult.rows[0];
    
    // Update withdrawal status
    await client.query(
      'UPDATE withdrawal_requests SET status = $1, processed_at = CURRENT_TIMESTAMP, processed_by = $2 WHERE id = $3',
      [status, req.user.id, id]
    );
    
    // Update transaction status
    await client.query(
      `UPDATE transactions SET status = $1, description = $2 WHERE user_id = $3 AND type = 'withdrawal' AND amount = $4 AND status = 'pending'`,
      [status, status === 'approved' ? 'Withdrawal approved' : 'Withdrawal rejected', withdrawal.user_id, -withdrawal.amount]
    );
    
    // If rejected, return money to wallet
    if (status === 'rejected') {
      await client.query(
        'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2',
        [withdrawal.amount, withdrawal.user_id]
      );
      
      // Create refund transaction
      await client.query(
        'INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5)',
        [withdrawal.user_id, 'refund', withdrawal.amount, 'Withdrawal rejected - refund', 'completed']
      );
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Withdrawal status updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating withdrawal:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Test endpoint to check withdrawals (no auth)
router.get('/test-withdrawals', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT wr.*, u.full_name, u.email 
      FROM withdrawal_requests wr
      LEFT JOIN users u ON wr.user_id = u.id
      ORDER BY wr.created_at DESC
    `);
    res.json({ 
      total: result.rows.length,
      withdrawals: result.rows 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fix user_profiles table
router.get('/fix-user-profiles', async (req, res) => {
  try {
    // Drop existing constraint if exists
    await pool.query('ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_key');
    
    // Add unique constraint
    await pool.query('ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id)');
    
    res.json({ message: 'user_profiles table fixed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fix users table columns
router.get('/fix-users-table', async (req, res) => {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS joining_fee_paid BOOLEAN DEFAULT FALSE');
    res.json({ message: 'users table fixed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Blog management routes
router.get('/blog', adminAuth, getBlogPosts);
router.post('/blog', adminAuth, createBlogPost);
router.put('/blog/:id', adminAuth, updateBlogPost);
router.delete('/blog/:id', adminAuth, deleteBlogPost);
router.put('/blog/:id/publish', adminAuth, publishBlogPost);
router.get('/blog/stats', adminAuth, getBlogStats);

module.exports = router;