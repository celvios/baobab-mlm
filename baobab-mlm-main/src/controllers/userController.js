const pool = require('../config/database');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get basic user info first
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    
    // Try to get profile data (may not exist)
    let profileData = {};
    try {
      const profileResult = await pool.query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [userId]
      );
      if (profileResult.rows.length > 0) {
        profileData = profileResult.rows[0];
      }
    } catch (e) {
      console.log('user_profiles table may not exist');
    }
    
    // Try to get wallet data (may not exist)
    let walletData = { balance: 0, total_earned: 0, total_withdrawn: 0 };
    try {
      const walletResult = await pool.query(
        'SELECT * FROM wallets WHERE user_id = $1',
        [userId]
      );
      if (walletResult.rows.length > 0) {
        walletData = walletResult.rows[0];
      }
    } catch (e) {
      console.log('wallets table may not exist');
    }
    
    // Calculate MLM earnings from team
    let teamSize = 0;
    try {
      const teamResult = await pool.query(
        'SELECT COUNT(*) as team_count FROM users WHERE referred_by = $1',
        [user.referral_code]
      );
      teamSize = parseInt(teamResult.rows[0]?.team_count || 0);
    } catch (e) {
      console.log('Error getting team size');
    }
    
    let mlmEarnings = 0;
    if (user.joining_fee_paid) {
      if (teamSize >= 2) mlmEarnings = teamSize * 1.5;
      if (teamSize >= 6) mlmEarnings = teamSize * 4.8;
      if (teamSize >= 14) mlmEarnings = teamSize * 30;
      if (teamSize >= 30) mlmEarnings = teamSize * 150;
      if (teamSize >= 62) mlmEarnings = teamSize * 750;
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      referralCode: user.referral_code,
      referredBy: user.referred_by,
      mlmLevel: user.mlm_level || 'no_stage',
      isActive: user.is_active,
      joiningFeePaid: user.joining_fee_paid || false,
      joiningFeeAmount: parseFloat(user.joining_fee_amount || 0),
      deliveryAddress: profileData.delivery_address,
      bankDetails: {
        bankName: profileData.bank_name,
        accountNumber: profileData.account_number,
        accountName: profileData.account_name
      },
      wallet: {
        balance: parseFloat(walletData.balance || 0),
        totalEarned: parseFloat(walletData.total_earned || 0),
        totalWithdrawn: parseFloat(walletData.total_withdrawn || 0),
        mlmEarnings: mlmEarnings
      },
      teamSize: teamSize
    });
  } catch (error) {
    console.error('Profile error:', error);
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
      SELECT t.id, t.type, t.amount, t.description, t.status, t.reference, t.created_at,
             a.name as admin_name
      FROM transactions t
      LEFT JOIN admins a ON t.admin_id = a.id
      WHERE t.user_id = $1 
      ORDER BY t.created_at DESC 
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
        adminName: t.admin_name,
        createdAt: t.created_at,
        isCredit: ['credit', 'deposit_approved', 'commission', 'referral_bonus'].includes(t.type),
        isDebit: ['debit', 'withdrawal', 'product_purchase', 'order_deleted'].includes(t.type)
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