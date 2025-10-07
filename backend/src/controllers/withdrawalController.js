const pool = require('../config/database');

const requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, bank, accountNumber, accountName } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    // Check wallet balance
    const walletResult = await pool.query('SELECT balance FROM wallets WHERE user_id = $1', [userId]);
    if (walletResult.rows.length === 0) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const currentBalance = parseFloat(walletResult.rows[0].balance);
    if (amount > currentBalance) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Update user bank details if provided
    if (bank && accountNumber && accountName) {
      await pool.query(
        `INSERT INTO user_profiles (user_id, bank_name, account_number, account_name) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (user_id) DO UPDATE 
         SET bank_name = $2, account_number = $3, account_name = $4`,
        [userId, bank, accountNumber, accountName]
      );
    }

    // Create withdrawal request
    const result = await pool.query(
      'INSERT INTO withdrawal_requests (user_id, amount) VALUES ($1, $2) RETURNING id, created_at',
      [userId, amount]
    );

    // Create transaction record
    await pool.query(
      'INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'withdrawal_request', amount, 'Withdrawal request submitted', 'pending']
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