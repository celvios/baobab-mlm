const pool = require('../config/database');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT 
        u.id, u.email, u.full_name, u.phone, u.referral_code, u.referred_by,
        u.mlm_level, u.is_active, u.joining_fee_paid, u.joining_fee_amount,
        up.delivery_address, up.bank_name, up.account_number, up.account_name,
        w.balance, w.total_earned, w.total_withdrawn
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE u.id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    
    // Calculate MLM earnings from team
    const teamResult = await pool.query(
      'SELECT COUNT(*) as team_count FROM users WHERE referred_by = $1',
      [user.referral_code]
    );
    const teamSize = parseInt(teamResult.rows[0]?.team_count || 0);
    
    let mlmEarnings = 0;
    if (user.joining_fee_paid) {
      if (teamSize >= 2) mlmEarnings = teamSize * 1.5; // Feeder stage
      if (teamSize >= 6) mlmEarnings = teamSize * 4.8; // Bronze
      if (teamSize >= 14) mlmEarnings = teamSize * 30; // Silver
      if (teamSize >= 30) mlmEarnings = teamSize * 150; // Gold
      if (teamSize >= 62) mlmEarnings = teamSize * 750; // Diamond
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      referralCode: user.referral_code,
      referredBy: user.referred_by,
      mlmLevel: user.mlm_level,
      isActive: user.is_active,
      joiningFeePaid: user.joining_fee_paid,
      joiningFeeAmount: parseFloat(user.joining_fee_amount || 0),
      deliveryAddress: user.delivery_address,
      bankDetails: {
        bankName: user.bank_name,
        accountNumber: user.account_number,
        accountName: user.account_name
      },
      wallet: {
        balance: parseFloat(user.balance || 0),
        totalEarned: parseFloat(user.total_earned || 0),
        totalWithdrawn: parseFloat(user.total_withdrawn || 0),
        mlmEarnings: mlmEarnings
      },
      teamSize: teamSize
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, deliveryAddress, bankName, accountNumber, accountName } = req.body;

    // Update user basic info
    await pool.query(
      'UPDATE users SET full_name = $1, phone = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [fullName, phone, userId]
    );

    // Update user profile
    await pool.query(`
      UPDATE user_profiles 
      SET delivery_address = $1, bank_name = $2, account_number = $3, account_name = $4, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = $5
    `, [deliveryAddress, bankName, accountNumber, accountName, userId]);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT balance, total_earned, total_withdrawn FROM wallets WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const wallet = result.rows[0];
    res.json({
      balance: parseFloat(wallet.balance),
      totalEarned: parseFloat(wallet.total_earned),
      totalWithdrawn: parseFloat(wallet.total_withdrawn)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT id, type, amount, description, status, reference, created_at
      FROM transactions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    const countResult = await pool.query('SELECT COUNT(*) FROM transactions WHERE user_id = $1', [userId]);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      transactions: result.rows.map(t => ({
        id: t.id,
        type: t.type,
        amount: parseFloat(t.amount),
        description: t.description,
        status: t.status,
        reference: t.reference,
        createdAt: t.created_at
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

module.exports = { getProfile, updateProfile, getWallet, getTransactionHistory };