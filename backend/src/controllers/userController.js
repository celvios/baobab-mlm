const pool = require('../config/database');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Getting profile for user ID:', userId);

    // Get basic user info first
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    console.log('Found user:', { id: user.id, email: user.email, fullName: user.full_name });
    
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
    
    // Auto-register if balance >= 18000
    if (walletData.balance >= 18000 && !user.joining_fee_paid) {
      await pool.query(
        'UPDATE users SET joining_fee_paid = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );
      user.joining_fee_paid = true;
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
    
    // Auto-advance to Feeder stage if registered + 2 referrals
    if ((user.joining_fee_paid || walletData.balance >= 18000) && teamSize >= 2 && user.mlm_level === 'no_stage') {
      await pool.query(
        'UPDATE users SET mlm_level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['feeder', userId]
      );
      user.mlm_level = 'feeder';
    }
    
    let mlmEarnings = 0;
    if (user.joining_fee_paid || walletData.balance >= 18000) {
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
      country: user.country || 'NG',
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
    console.error('Profile error details:', error);
    // Return basic user info even if other queries fail
    try {
      const basicUser = await pool.query('SELECT id, email, full_name, referral_code, mlm_level FROM users WHERE id = $1', [req.user.id]);
      if (basicUser.rows.length > 0) {
        const user = basicUser.rows[0];
        return res.json({
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          country: user.country || 'NG',
          referralCode: user.referral_code,
          mlmLevel: user.mlm_level || 'no_stage',
          wallet: { balance: 0, totalEarned: 0, totalWithdrawn: 0, mlmEarnings: 0 },
          teamSize: 0
        });
      }
    } catch (fallbackError) {
      console.error('Fallback query failed:', fallbackError);
    }
    res.status(500).json({ message: 'Server error: ' + error.message });
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