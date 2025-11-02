const pool = require('../config/database');
const { sendWithdrawalPendingEmail } = require('../utils/emailService');

const requestWithdrawal = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const userId = req.user.id;
    const { amount, bank, accountNumber, accountName, source = 'wallet' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    if (!['wallet', 'mlm_earnings'].includes(source)) {
      return res.status(400).json({ message: 'Invalid withdrawal source' });
    }

    // Check balance based on source
    const walletResult = await client.query('SELECT balance, total_earned FROM wallets WHERE user_id = $1', [userId]);
    if (walletResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const currentBalance = source === 'mlm_earnings' 
      ? parseFloat(walletResult.rows[0].total_earned)
      : parseFloat(walletResult.rows[0].balance);

    if (amount > currentBalance) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `Insufficient ${source === 'mlm_earnings' ? 'MLM earnings' : 'wallet balance'}` });
    }

    // Deduct from appropriate balance
    if (source === 'mlm_earnings') {
      await client.query(
        'UPDATE wallets SET total_earned = total_earned - $1 WHERE user_id = $2',
        [amount, userId]
      );
    } else {
      await client.query(
        'UPDATE wallets SET balance = balance - $1 WHERE user_id = $2',
        [amount, userId]
      );
    }

    // Update user bank details if provided
    if (bank && accountNumber && accountName) {
      await client.query(
        `INSERT INTO user_profiles (user_id, bank_name, account_number, account_name) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (user_id) DO UPDATE 
         SET bank_name = $2, account_number = $3, account_name = $4`,
        [userId, bank, accountNumber, accountName]
      );
    }

    // Create withdrawal request with source
    const result = await client.query(
      'INSERT INTO withdrawal_requests (user_id, amount, source) VALUES ($1, $2, $3) RETURNING id, created_at',
      [userId, amount, source]
    );

    // Create transaction record
    await client.query(
      'INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'withdrawal', -amount, `Withdrawal from ${source === 'mlm_earnings' ? 'MLM earnings' : 'wallet'}`, 'pending']
    );

    await client.query('COMMIT');
    
    // Send email notification
    try {
      const userResult = await client.query('SELECT email, full_name FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length > 0) {
        await sendWithdrawalPendingEmail(userResult.rows[0].email, userResult.rows[0].full_name, parseFloat(amount));
      }
    } catch (emailError) {
      console.log('Failed to send withdrawal email:', emailError.message);
    }
    
    res.status(201).json({
      message: 'Withdrawal request submitted successfully',
      requestId: result.rows[0].id,
      amount: parseFloat(amount),
      createdAt: result.rows[0].created_at
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Withdrawal error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    client.release();
  }
};

const getWithdrawalRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT id, amount, status, admin_notes, created_at, processed_at
      FROM withdrawal_requests 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    const countResult = await pool.query('SELECT COUNT(*) FROM withdrawal_requests WHERE user_id = $1', [userId]);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      requests: result.rows.map(r => ({
        id: r.id,
        amount: parseFloat(r.amount),
        status: r.status,
        adminNotes: r.admin_notes,
        createdAt: r.created_at,
        processedAt: r.processed_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { requestWithdrawal, getWithdrawalRequests };