const pool = require('../config/database');

const getPendingDeposits = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT dr.*, u.full_name as user_name, u.email as user_email
      FROM deposit_requests dr
      JOIN users u ON dr.user_id = u.id
      ORDER BY 
        CASE dr.status 
          WHEN 'pending' THEN 1 
          WHEN 'approved' THEN 2 
          WHEN 'rejected' THEN 3 
        END,
        dr.created_at DESC
    `);
    
    res.json({ deposits: result.rows });
  } catch (error) {
    console.error('Error fetching deposits:', error);
    res.status(500).json({ error: 'Failed to fetch deposits' });
  }
};

const approveDeposit = async (req, res) => {
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
    const amount = parseFloat(deposit.rows[0].amount);
    
    // Only unlock dashboard if amount >= 18000
    const shouldUnlock = amount >= 18000;
    
    await client.query(
      `UPDATE deposit_requests 
       SET status = 'approved', confirmed_by = $1, confirmed_at = NOW()
       WHERE id = $2`,
      [adminId, depositId]
    );
    
    await client.query(
      `UPDATE users 
       SET deposit_amount = COALESCE(deposit_amount, 0) + $1,
           deposit_confirmed = $2,
           deposit_confirmed_at = NOW(),
           dashboard_unlocked = $2,
           joining_fee_paid = $2,
           mlm_level = CASE WHEN $2 THEN 'feeder' ELSE mlm_level END
       WHERE id = $3`,
      [amount, shouldUnlock, userId]
    );
    
    // If unlocking dashboard, process MLM referral
    if (shouldUnlock) {
      const mlmService = require('../services/mlmService');
      
      // Get referrer
      const userResult = await client.query('SELECT referred_by FROM users WHERE id = $1', [userId]);
      if (userResult.rows[0]?.referred_by) {
        const referrerResult = await client.query('SELECT id FROM users WHERE referral_code = $1', [userResult.rows[0].referred_by]);
        if (referrerResult.rows.length > 0) {
          await mlmService.processReferral(referrerResult.rows[0].id, userId);
        }
      }
    }
    
    await client.query('COMMIT');
    
    res.json({ message: shouldUnlock ? 'Deposit approved and dashboard unlocked' : 'Deposit approved but amount is below ₦18,000 minimum' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error approving deposit:', error);
    res.status(500).json({ error: 'Failed to approve deposit' });
  } finally {
    client.release();
  }
};

const rejectDeposit = async (req, res) => {
  try {
    const { depositId } = req.params;
    const { reason } = req.body;
    const adminId = req.admin.id;
    
    await pool.query(
      `UPDATE deposit_requests 
       SET status = 'rejected', admin_notes = $1, confirmed_by = $2, confirmed_at = NOW()
       WHERE id = $3`,
      [reason, adminId, depositId]
    );
    
    res.json({ message: 'Deposit rejected' });
  } catch (error) {
    console.error('Error rejecting deposit:', error);
    res.status(500).json({ error: 'Failed to reject deposit' });
  }
};

module.exports = { getPendingDeposits, approveDeposit, rejectDeposit };
