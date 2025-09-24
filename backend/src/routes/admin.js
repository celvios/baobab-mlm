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
      pool.query(`
        SELECT COALESCE(
          (SELECT SUM(total_amount) FROM orders WHERE order_status = 'completed') +
          (SELECT SUM(amount) FROM transactions WHERE type = 'credit' AND status = 'completed'),
          0
        ) as total
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

module.exports = router;