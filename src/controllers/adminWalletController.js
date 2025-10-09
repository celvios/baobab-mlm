const pool = require('../config/database');
const { sendDepositApprovedEmail, sendDepositRejectedEmail } = require('../utils/emailService');

const creditUser = async (req, res) => {
  try {
    const { userId, amount, description = 'Admin credit' } = req.body;
    const adminId = req.admin.id;

    if (!userId || !amount) {
      return res.status(400).json({ message: 'User ID and amount are required' });
    }

    const numAmount = parseFloat(amount);
    const isDebit = numAmount < 0;
    const absAmount = Math.abs(numAmount);

    // Get user details
    const userResult = await pool.query('SELECT full_name, email FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = userResult.rows[0];

    // Check if wallet exists, create if not
    let walletResult = await pool.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
    if (walletResult.rows.length === 0) {
      await pool.query('INSERT INTO wallets (user_id, balance) VALUES ($1, $2)', [userId, 0]);
      walletResult = await pool.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
    }

    const currentBalance = parseFloat(walletResult.rows[0].balance || 0);

    // For debit, check if sufficient balance
    if (isDebit && currentBalance < absAmount) {
      return res.status(400).json({ message: 'Insufficient balance for debit' });
    }

    // Update wallet balance
    const newBalance = isDebit ? currentBalance - absAmount : currentBalance + absAmount;
    await pool.query('UPDATE wallets SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2', [newBalance, userId]);

    // Create transaction record
    await pool.query(`
      INSERT INTO transactions (user_id, type, amount, description, status, admin_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [userId, isDebit ? 'debit' : 'credit', absAmount, description, 'completed', adminId]);

    // Log admin activity
    await pool.query(`
      INSERT INTO admin_activity_logs (admin_id, action, details, user_id)
      VALUES ($1, $2, $3, $4)
    `, [adminId, isDebit ? 'debit_user' : 'credit_user', `${isDebit ? 'Debited' : 'Credited'} ${user.full_name} (${user.email}) with ₦${absAmount.toLocaleString()}: ${description}`, userId]);

    res.json({
      message: `User ${isDebit ? 'debited' : 'credited'} successfully`,
      amount: absAmount,
      newBalance: newBalance,
      type: isDebit ? 'debit' : 'credit'
    });
  } catch (error) {
    console.error('Credit/Debit user error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const approveDeposit = async (req, res) => {
  try {
    const { depositId } = req.params;
    const { amount, description = 'Deposit approved' } = req.body;
    const adminId = req.admin.id;

    // Get deposit details
    const depositResult = await pool.query('SELECT * FROM deposit_requests WHERE id = $1', [depositId]);
    if (depositResult.rows.length === 0) {
      return res.status(404).json({ message: 'Deposit request not found' });
    }

    const deposit = depositResult.rows[0];
    const userId = deposit.user_id;
    const depositAmount = parseFloat(amount || deposit.amount);

    // Get user details
    const userResult = await pool.query('SELECT full_name, email FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    // Update deposit status
    await pool.query('UPDATE deposit_requests SET status = $1, processed_at = CURRENT_TIMESTAMP, admin_id = $2 WHERE id = $3', ['approved', adminId, depositId]);

    // Update wallet balance
    await pool.query('UPDATE wallets SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2', [depositAmount, userId]);

    // Create transaction record
    await pool.query(`
      INSERT INTO transactions (user_id, type, amount, description, status, admin_id, reference)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [userId, 'credit', depositAmount, description, 'completed', adminId, `DEP${depositId}`]);

    // Log admin activity
    await pool.query(`
      INSERT INTO admin_activity_logs (admin_id, action, details, user_id)
      VALUES ($1, $2, $3, $4)
    `, [adminId, 'approve_deposit', `Approved deposit for ${user.full_name} (${user.email}) - ₦${depositAmount.toLocaleString()}`, userId]);

    // Send approval email
    try {
      await sendDepositApprovedEmail(user.email, user.full_name, depositAmount);
    } catch (emailError) {
      console.log('Failed to send deposit approval email:', emailError.message);
    }

    res.json({
      message: 'Deposit approved successfully',
      amount: depositAmount,
      userId: userId
    });
  } catch (error) {
    console.error('Approve deposit error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const activities = await pool.query(`
      SELECT aal.*, u.full_name as user_name, u.email as user_email, a.name as admin_name
      FROM admin_activity_logs aal
      LEFT JOIN users u ON aal.user_id = u.id
      LEFT JOIN admins a ON aal.admin_id = a.id
      ORDER BY aal.created_at DESC
      LIMIT $1
    `, [limit]);

    res.json({
      activities: activities.rows.map(activity => ({
        id: activity.id,
        action: activity.action,
        details: activity.details,
        adminName: activity.admin_name,
        userName: activity.user_name,
        userEmail: activity.user_email,
        createdAt: activity.created_at
      }))
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const rejectDeposit = async (req, res) => {
  try {
    const { depositId } = req.params;
    const { reason = 'Deposit rejected' } = req.body;
    const adminId = req.admin.id;

    // Get deposit details
    const depositResult = await pool.query('SELECT * FROM deposit_requests WHERE id = $1', [depositId]);
    if (depositResult.rows.length === 0) {
      return res.status(404).json({ message: 'Deposit request not found' });
    }

    const deposit = depositResult.rows[0];
    const userId = deposit.user_id;
    const depositAmount = parseFloat(deposit.amount);

    // Get user details
    const userResult = await pool.query('SELECT full_name, email FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    // Update deposit status
    await pool.query('UPDATE deposit_requests SET status = $1, admin_notes = $2, processed_at = CURRENT_TIMESTAMP, admin_id = $3 WHERE id = $4', ['rejected', reason, adminId, depositId]);

    // Log admin activity
    await pool.query(`
      INSERT INTO admin_activity_logs (admin_id, action, details, user_id)
      VALUES ($1, $2, $3, $4)
    `, [adminId, 'reject_deposit', `Rejected deposit for ${user.full_name} (${user.email}) - ₦${depositAmount.toLocaleString()}. Reason: ${reason}`, userId]);

    // Send rejection email
    try {
      await sendDepositRejectedEmail(user.email, user.full_name, depositAmount);
    } catch (emailError) {
      console.log('Failed to send deposit rejection email:', emailError.message);
    }

    res.json({
      message: 'Deposit rejected successfully',
      depositId: depositId
    });
  } catch (error) {
    console.error('Reject deposit error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { creditUser, approveDeposit, rejectDeposit, getRecentActivity };