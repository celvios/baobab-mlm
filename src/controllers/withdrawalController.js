const pool = require('../config/database');

const requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, source = 'balance' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    if (!['balance', 'earnings'].includes(source)) {
      return res.status(400).json({ message: 'Invalid withdrawal source' });
    }

    // Check wallet
    const walletResult = await pool.query('SELECT balance, total_earned FROM wallets WHERE user_id = $1', [userId]);
    if (walletResult.rows.length === 0) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const availableAmount = source === 'earnings' 
      ? parseFloat(walletResult.rows[0].total_earned)
      : parseFloat(walletResult.rows[0].balance);

    if (amount > availableAmount) {
      return res.status(400).json({ message: `Insufficient ${source === 'earnings' ? 'MLM earnings' : 'balance'}` });
    }

    // Check if user has complete bank details
    const profileResult = await pool.query(
      'SELECT bank_name, account_number, account_name FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (profileResult.rows.length === 0 || !profileResult.rows[0].bank_name || !profileResult.rows[0].account_number) {
      return res.status(400).json({ message: 'Please complete your bank details first' });
    }

    // Create withdrawal request
    const result = await pool.query(
      'INSERT INTO withdrawal_requests (user_id, amount, source) VALUES ($1, $2, $3) RETURNING id, created_at',
      [userId, amount, source]
    );

    // Create transaction record
    await pool.query(
      'INSERT INTO transactions (user_id, type, amount, description, status, reference) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, 'withdrawal_request', amount, 'Withdrawal request submitted', 'pending', `WR${result.rows[0].id}`]
    );

    res.status(201).json({
      message: 'Withdrawal request submitted successfully',
      requestId: result.rows[0].id,
      amount: parseFloat(amount),
      createdAt: result.rows[0].created_at
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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