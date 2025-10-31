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
    // Whitelist allowed fields to prevent SQL injection
    const allowedFields = ['order_status', 'payment_status', 'is_picked_up', 'payment_reference'];
    const filteredData = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });
    
    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    // If marking as picked up, also set order_status to delivered
    if (filteredData.is_picked_up === true) {
      filteredData.order_status = 'delivered';
    }
    
    const setClause = Object.keys(filteredData).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [orderId, ...Object.values(filteredData)];
    
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

// Create new product with Cloudinary upload
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const productUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/products', adminAuth, productUpload.single('image'), async (req, res) => {
  const { name, description, price, category, stock_quantity } = req.body;
  
  try {
    let image_url = null;
    
    // Upload to Cloudinary if image provided
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'baobab-products' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });
      image_url = result.secure_url;
    }
    
    const result = await pool.query(
      'INSERT INTO products (name, description, price, category, stock, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, price, category, stock_quantity || 0, image_url]
    );
    
    res.json({ message: 'Product created successfully', product: result.rows[0] });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product
router.put('/products/:productId', adminAuth, productUpload.single('image'), async (req, res) => {
  const { productId } = req.params;
  const { name, description, price, category, stock_quantity } = req.body;
  
  try {
    let image_url = req.body.image_url; // Keep existing if no new image
    
    // Upload new image to Cloudinary if provided
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'baobab-products' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });
      image_url = result.secure_url;
    }
    
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
        'Order placed by ' || u.full_name || ': ₦' || o.total_amount::text as description,
        o.created_at
      FROM orders o
      JOIN users u ON o.user_id = u.id
      UNION ALL
      SELECT 
        'Withdrawal request from ' || u.full_name || ': ₦' || wr.amount::text as description,
        wr.created_at
      FROM withdrawal_requests wr
      JOIN users u ON wr.user_id = u.id
      UNION ALL
      SELECT 
        'Deposit request from ' || u.full_name || ': ₦' || dr.amount::text as description,
        dr.created_at
      FROM deposit_requests dr
      JOIN users u ON dr.user_id = u.id
      UNION ALL
      SELECT 
        'Admin credited ' || u.full_name || ': ₦' || t.amount::text as description,
        t.created_at
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.type = 'credit' AND t.description = 'Admin credit'
      ORDER BY created_at DESC
      LIMIT 15
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
    // First check which columns exist
    const columnsCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'deposit_requests'
    `);
    const columns = columnsCheck.rows.map(r => r.column_name);
    const hasPaymentProof = columns.includes('payment_proof');
    const hasProofUrl = columns.includes('proof_url');
    const hasPaymentMethod = columns.includes('payment_method');
    
    let paymentProofSelect = 'NULL as payment_proof';
    if (hasPaymentProof && hasProofUrl) {
      paymentProofSelect = 'COALESCE(dr.payment_proof, dr.proof_url) as payment_proof';
    } else if (hasPaymentProof) {
      paymentProofSelect = 'dr.payment_proof';
    } else if (hasProofUrl) {
      paymentProofSelect = 'dr.proof_url as payment_proof';
    }
    
    const paymentMethodSelect = hasPaymentMethod ? 'dr.payment_method' : "'Bank Transfer' as payment_method";
    
    const result = await pool.query(`
      SELECT 
        dr.id, dr.user_id, dr.amount, dr.status, dr.created_at,
        ${paymentProofSelect},
        ${paymentMethodSelect},
        u.full_name as user_name, u.email as user_email
      FROM deposit_requests dr
      LEFT JOIN users u ON dr.user_id = u.id
      ORDER BY dr.created_at DESC
    `);
    res.json({ deposits: result.rows });
  } catch (error) {
    console.error('Error fetching deposit requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/approve-deposit', adminAuth, async (req, res) => {
  const { depositId, amount } = req.body;
  console.log('Approving deposit:', depositId, 'Amount:', amount);
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get deposit request and user info
    const depositResult = await client.query('SELECT dr.*, u.email, u.full_name, u.referred_by FROM deposit_requests dr JOIN users u ON dr.user_id = u.id WHERE dr.id = $1', [depositId]);
    const deposit = depositResult.rows[0];
    
    if (!deposit) {
      await client.query('ROLLBACK');
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
    
    // Unlock dashboard (stay at no_stage until 6 people)
    const unlockResult = await client.query(
      `UPDATE users 
       SET dashboard_unlocked = TRUE,
           deposit_confirmed = TRUE,
           deposit_confirmed_at = NOW()
       WHERE id = $1
       RETURNING id, email, dashboard_unlocked, deposit_confirmed`,
      [deposit.user_id]
    );
    console.log('Dashboard unlocked for user:', unlockResult.rows[0]);
    
    // Check if deposit meets minimum threshold (USD equivalent) and user was referred
    const { meetsMinimumDeposit } = require('../utils/currencyUtils');
    const meetsThreshold = await meetsMinimumDeposit(amount);
    
    if (meetsThreshold && deposit.referred_by) {
      // Get referrer ID
      const referrerResult = await client.query('SELECT id FROM users WHERE referral_code = $1', [deposit.referred_by]);
      
      if (referrerResult.rows.length > 0) {
        const referrerId = referrerResult.rows[0].id;
        
        // Check if referral bonus already paid
        const bonusCheck = await client.query(
          'SELECT id FROM referral_earnings WHERE user_id = $1 AND referred_user_id = $2',
          [referrerId, deposit.user_id]
        );
        
        if (bonusCheck.rows.length === 0) {
          // Process referral bonus
          const mlmService = require('../services/mlmService');
          try {
            await mlmService.processReferral(referrerId, deposit.user_id);
            console.log(`Referral bonus activated for user ${deposit.user_id} (deposited ₦${amount})`);
          } catch (mlmError) {
            console.error('Error processing referral:', mlmError);
            // Continue even if MLM processing fails
          }
        }
      }
    }
    
    await client.query('COMMIT');
    
    // Send email notification
    try {
      const { sendDepositApprovedEmail } = require('../utils/emailService');
      await sendDepositApprovedEmail(deposit.email, deposit.full_name, parseFloat(amount));
    } catch (emailError) {
      console.log('Failed to send deposit approval email:', emailError.message);
    }
    
    res.json({ message: 'Deposit approved and user credited successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error approving deposit:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Phase 2: Approve deposit with dashboard unlock
router.post('/deposits/:depositId/approve', adminAuth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { depositId } = req.params;
    const adminId = req.admin.id;
    
    await client.query('BEGIN');
    
    const deposit = await client.query(
      'SELECT * FROM deposit_requests WHERE id = $1',
      [depositId]
    );
    
    if (deposit.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Deposit not found' });
    }
    
    const userId = deposit.rows[0].user_id;
    const amount = deposit.rows[0].amount;
    
    await client.query(
      `UPDATE deposit_requests 
       SET status = 'approved', confirmed_by = $1, confirmed_at = NOW()
       WHERE id = $2`,
      [adminId, depositId]
    );
    
    await client.query(
      `UPDATE users 
       SET deposit_amount = deposit_amount + $1,
           deposit_confirmed = TRUE,
           deposit_confirmed_at = NOW(),
           dashboard_unlocked = TRUE,
           mlm_level = CASE WHEN mlm_level = 'no_stage' THEN 'feeder' ELSE mlm_level END
       WHERE id = $2`,
      [amount, userId]
    );
    
    await client.query(
      `INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
       VALUES ($1, 'feeder', 0, 6)
       ON CONFLICT (user_id, stage) DO NOTHING`,
      [userId]
    );
    
    await client.query('COMMIT');
    
    res.json({ message: 'Deposit approved successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error approving deposit:', error);
    res.status(500).json({ error: 'Failed to approve deposit' });
  } finally {
    client.release();
  }
});

router.post('/reject-deposit', adminAuth, async (req, res) => {
  const { depositId } = req.body;
  
  try {
    // Get deposit details
    const depositResult = await pool.query('SELECT dr.*, u.email, u.full_name FROM deposit_requests dr JOIN users u ON dr.user_id = u.id WHERE dr.id = $1', [depositId]);
    const deposit = depositResult.rows[0];
    
    await pool.query(
      'UPDATE deposit_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['rejected', depositId]
    );
    
    // Send email notification
    if (deposit) {
      try {
        const { sendDepositRejectedEmail } = require('../utils/emailService');
        await sendDepositRejectedEmail(deposit.email, deposit.full_name, parseFloat(deposit.amount));
      } catch (emailError) {
        console.log('Failed to send deposit rejection email:', emailError.message);
      }
    }
    
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
      source: 'wallet',
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
    
    // Get withdrawal details with user info
    const withdrawalResult = await client.query(
      'SELECT wr.*, u.email, u.full_name FROM withdrawal_requests wr JOIN users u ON wr.user_id = u.id WHERE wr.id = $1',
      [id]
    );
    
    if (withdrawalResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Withdrawal not found' });
    }
    
    const withdrawal = withdrawalResult.rows[0];
    
    // Update withdrawal status
    await client.query(
      'UPDATE withdrawal_requests SET status = $1, processed_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, id]
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
    
    // Send email notification
    try {
      const { sendWithdrawalApprovedEmail, sendWithdrawalRejectedEmail } = require('../utils/emailService');
      if (status === 'approved') {
        await sendWithdrawalApprovedEmail(withdrawal.email, withdrawal.full_name, parseFloat(withdrawal.amount));
      } else if (status === 'rejected') {
        await sendWithdrawalRejectedEmail(withdrawal.email, withdrawal.full_name, parseFloat(withdrawal.amount));
      }
    } catch (emailError) {
      console.log('Failed to send withdrawal email:', emailError.message);
    }
    
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
      source: 'wallet',
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
    
    res.json({ 
      total: result.rows.length,
      requests: formattedRequests
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

// Make user admin by email
router.get('/make-admin/:email', async (req, res) => {
  try {
    const { email } = req.params;
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT \'user\'');
    await pool.query('UPDATE users SET role = $1 WHERE email = $2', ['admin', email]);
    res.json({ message: `User ${email} is now an admin` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Cloudinary config
router.get('/test-cloudinary', async (req, res) => {
  try {
    const cloudinary = require('../config/cloudinary');
    res.json({
      configured: !!process.env.CLOUDINARY_CLOUD_NAME,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET',
      api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test image upload
router.post('/test-upload', productUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const cloudinary = require('../config/cloudinary');
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'baobab-products' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });
    
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fix deposit table column size
router.get('/fix-deposit-table', async (req, res) => {
  try {
    await pool.query('ALTER TABLE deposit_requests ALTER COLUMN payment_proof TYPE TEXT');
    res.json({ message: 'Deposit table fixed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add password reset columns
router.get('/add-password-reset-columns', async (req, res) => {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255)');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT \'NG\'');
    res.json({ message: 'Password reset columns added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run country migration
router.get('/run-country-migration', async (req, res) => {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT \'NG\'');
    await pool.query('UPDATE users SET country = \'NG\' WHERE country IS NULL');
    res.json({ message: 'Country migration completed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new admin
router.get('/create-baobab-admin', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const email = 'info@baobabworldwide.com';
    const password = 'Admin@2024';
    const fullName = 'Baobab Admin';
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Add role column if not exists
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT \'user\'');
    
    // Create admin in users table
    await pool.query(
      'INSERT INTO users (full_name, email, password, role, is_active) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO UPDATE SET password = $3, role = $4',
      [fullName, email, hashedPassword, 'admin', true]
    );
    
    res.json({ 
      message: 'Admin created successfully',
      email: email,
      password: password
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test email
router.get('/test-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { sendOTPEmail } = require('../utils/emailService');
    await sendOTPEmail(email, '123456', 'Test User');
    res.json({ message: `Test email sent to ${email}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Optimize database with indexes
router.get('/optimize-database', async (req, res) => {
  try {
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_market_updates_user_id ON market_updates(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_market_updates_is_read ON market_updates(is_read)');
    res.json({ message: 'Database optimized with indexes successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Get email history
router.post('/emails/send', adminAuth, async (req, res) => {
  try {
    const { subject, message, category } = req.body;
    const sgMail = require('@sendgrid/mail');
    
    // Get users based on category
    let query = 'SELECT email, full_name FROM users WHERE role != $1';
    const result = await pool.query(query, ['admin']);
    const users = result.rows;
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'No users found' });
    }
    
    // Send email to all users
    const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@baobab.com';
    let successCount = 0;
    const emailPromises = users.map(user => {
      // Replace shortcodes with user data (case-insensitive)
      const personalizedMessage = message
        .replace(/{fullName}/gi, user.full_name || 'User')
        .replace(/{fullname}/gi, user.full_name || 'User')
        .replace(/{email}/gi, user.email)
        .replace(/{firstName}/gi, (user.full_name || 'User').split(' ')[0])
        .replace(/{firstname}/gi, (user.full_name || 'User').split(' ')[0]);
      
      const msg = {
        to: user.email,
        from: FROM_EMAIL,
        subject: subject,
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="margin: 20px 0; line-height: 1.6;">
      ${personalizedMessage}
    </div>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    <p style="color: #999; font-size: 10px; font-style: italic;">You are receiving this email because you are a member of Baobab. If you have any questions, contact us at <a href="mailto:info@baobaworldwide.com">info@baobaworldwide.com</a></p>
  </div>
</body>
</html>`
      };
      return sgMail.send(msg).then(() => {
        successCount++;
        return true;
      }).catch(err => {
        console.error(`Failed to send to ${user.email}:`, err);
        return null;
      });
    });
    
    await Promise.all(emailPromises);
    
    // Save to email history
    try {
      // Create table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS email_history (
          id SERIAL PRIMARY KEY,
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          recipient_count INTEGER DEFAULT 0,
          sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await pool.query(
        'INSERT INTO email_history (subject, message, recipient_count, sent_at) VALUES ($1, $2, $3, NOW())',
        [subject, message, successCount]
      );
      console.log('Email history saved successfully');
    } catch (dbError) {
      console.log('Failed to save email history:', dbError.message);
    }
    
    res.json({ 
      message: 'Emails sent successfully',
      sentCount: successCount
    });
  } catch (error) {
    console.error('Error sending bulk email:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get email history
router.get('/emails/history', adminAuth, async (req, res) => {
  try {
    // Create table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_history (
        id SERIAL PRIMARY KEY,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        recipient_count INTEGER DEFAULT 0,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const result = await pool.query(`
      SELECT id, subject, message, recipient_count, sent_at as created_at
      FROM email_history
      ORDER BY sent_at DESC
      LIMIT 50
    `);
    res.json({ emails: result.rows });
  } catch (error) {
    console.log('Email history error:', error.message);
    res.json({ emails: [] });
  }
});

// Blog management routes
router.get('/blog', adminAuth, getBlogPosts);
router.post('/blog', adminAuth, createBlogPost);
router.put('/blog/:id', adminAuth, updateBlogPost);
router.delete('/blog/:id', adminAuth, deleteBlogPost);
router.put('/blog/:id/publish', adminAuth, publishBlogPost);
router.get('/blog/stats', adminAuth, getBlogStats);

// Bulk email routes
const bulkEmailController = require('../controllers/bulkEmailController');
router.post('/bulk-email', adminAuth, bulkEmailController.sendBulkEmail);
router.get('/email-stats', adminAuth, bulkEmailController.getEmailStats);

// Check and update user level progression
router.get('/check-level-progression/:email', async (req, res) => {
  const { email } = req.params;
  
  try {
    const userResult = await pool.query(
      'SELECT id, mlm_level, referral_code FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Get referral count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE referred_by = $1',
      [user.referral_code]
    );
    
    const count = parseInt(countResult.rows[0].count);
    let newLevel = user.mlm_level;
    
    // Check progression
    if (user.mlm_level === 'no_stage' && count >= 6) {
      newLevel = 'feeder';
    } else if (user.mlm_level === 'feeder' && count >= 6) {
      newLevel = 'bronze';
    } else if (user.mlm_level === 'bronze' && count >= 20) {
      newLevel = 'silver';
    } else if (user.mlm_level === 'silver' && count >= 34) {
      newLevel = 'gold';
    } else if (user.mlm_level === 'gold' && count >= 48) {
      newLevel = 'diamond';
    } else if (user.mlm_level === 'diamond' && count >= 62) {
      newLevel = 'infinity';
    }
    
    if (newLevel !== user.mlm_level) {
      await pool.query('UPDATE users SET mlm_level = $1 WHERE id = $2', [newLevel, user.id]);
      
      await pool.query(
        `INSERT INTO level_progressions (user_id, from_level, to_level, referrals_count)
         VALUES ($1, $2, $3, $4)`,
        [user.id, user.mlm_level, newLevel, count]
      );
      
      await pool.query(
        `INSERT INTO market_updates (user_id, title, message, type)
         VALUES ($1, $2, $3, 'success')`,
        [user.id, 'Level Up!', `Congratulations! You've been promoted to ${newLevel.toUpperCase()} level!`]
      );
    }
    
    res.json({
      message: newLevel !== user.mlm_level ? 'Level updated successfully' : 'No level change needed',
      oldLevel: user.mlm_level,
      newLevel: newLevel,
      referralCount: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate test referrals for a user
router.get('/generate-test-referrals/:email', async (req, res) => {
  const { email } = req.params;
  
  try {
    const referrerResult = await pool.query(
      'SELECT id, referral_code, mlm_level FROM users WHERE email = $1',
      [email]
    );
    
    if (referrerResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const referrer = referrerResult.rows[0];
    const bcrypt = require('bcryptjs');
    const referrals = [];
    const mlmService = require('../services/mlmService');
    
    for (let i = 1; i <= 6; i++) {
      const testEmail = `testreferral${i}_${Date.now()}@test.com`;
      const password = await bcrypt.hash('Test@123', 10);
      const referralCode = `TEST${Date.now()}${i}`;
      
      const userResult = await pool.query(
        `INSERT INTO users (full_name, email, password, phone, referral_code, referred_by, mlm_level, joining_fee_paid, country)
         VALUES ($1, $2, $3, $4, $5, $6, 'no_stage', true, 'NG') RETURNING id`,
        [`Test Referral ${i}`, testEmail, password, `+23480${10000000 + i}`, referralCode, referrer.referral_code]
      );
      
      const userId = userResult.rows[0].id;
      
      await pool.query(
        'INSERT INTO wallets (user_id, balance, total_earned) VALUES ($1, $2, $3)',
        [userId, 18000, 18000]
      );
      
      await pool.query('INSERT INTO user_profiles (user_id) VALUES ($1)', [userId]);
      
      await pool.query(
        `INSERT INTO deposit_requests (user_id, amount, status)
         VALUES ($1, 18000, 'approved')`,
        [userId]
      );
      
      await mlmService.processReferral(referrer.id, userId);
      
      referrals.push({ id: userId, email: testEmail });
    }
    
    const updatedReferrer = await pool.query(
      'SELECT mlm_level FROM users WHERE id = $1',
      [referrer.id]
    );
    
    const earnings = await pool.query(
      'SELECT SUM(amount) as total FROM referral_earnings WHERE user_id = $1',
      [referrer.id]
    );
    
    res.json({
      message: 'Test referrals generated successfully',
      referrerNewLevel: updatedReferrer.rows[0].mlm_level,
      totalReferrals: referrals.length,
      totalEarnings: parseFloat(earnings.rows[0].total || 0),
      referrals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Convert product prices from Naira to USD
router.get('/convert-prices-to-usd', async (req, res) => {
  try {
    const result = await pool.query('UPDATE products SET price = ROUND(price / 1500, 2) WHERE price > 100 RETURNING *');
    res.json({ 
      message: 'Product prices converted to USD successfully',
      updatedProducts: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all data except admin
router.get('/clear-all-data', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get admin user IDs
    const adminResult = await client.query("SELECT id FROM users WHERE role = 'admin'");
    const adminIds = adminResult.rows.map(r => r.id);
    
    // Delete all non-admin data
    await client.query('DELETE FROM market_updates WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM referral_earnings WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM level_progressions WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM transactions WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM withdrawal_requests WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM deposit_requests WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM orders WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM user_profiles WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM wallets WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM mlm_matrix WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM stage_matrix WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM stage_matrix_members WHERE matrix_owner_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query("DELETE FROM users WHERE role != 'admin' OR role IS NULL");
    
    await client.query('COMMIT');
    res.json({ message: 'All data cleared except admin accounts', adminCount: adminIds.length });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Fix stuck stages
const { fixStuckStages, manualUpgradeUser, recalculateQualifiedSlots } = require('../controllers/adminFixController');
router.get('/fix-stuck-stages', adminAuth, fixStuckStages);
router.get('/fix-stuck-stages-public', fixStuckStages);
router.get('/manual-upgrade/:email', manualUpgradeUser);
router.get('/recalculate-slots', recalculateQualifiedSlots);

// Clear all data except admin (POST with confirmation)
router.post('/clear-all-data', adminAuth, async (req, res) => {
  const { confirm } = req.body;
  
  if (confirm !== 'DELETE_ALL_DATA') {
    return res.status(400).json({ error: 'Confirmation required' });
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const adminResult = await client.query("SELECT id FROM users WHERE role = 'admin'");
    const adminIds = adminResult.rows.map(r => r.id);
    
    await client.query('DELETE FROM market_updates WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM referral_earnings WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM level_progressions WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM transactions WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM withdrawal_requests WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM deposit_requests WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM orders WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM user_profiles WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM wallets WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM mlm_matrix WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM stage_matrix WHERE user_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query('DELETE FROM stage_matrix_members WHERE matrix_owner_id NOT IN (SELECT id FROM users WHERE role = \'admin\')');
    await client.query("DELETE FROM users WHERE role != 'admin' OR role IS NULL");
    
    await client.query('COMMIT');
    res.json({ message: 'All data cleared except admin accounts', adminCount: adminIds.length });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;