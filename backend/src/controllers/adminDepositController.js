const pool = require('../config/database');

const getPendingDeposits = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT dr.*, u.full_name, u.email 
      FROM deposit_requests dr
      JOIN users u ON dr.user_id = u.id
      WHERE dr.status = 'pending'
      ORDER BY dr.created_at DESC
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
