const pool = require('../config/database');

const getWithdrawals = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', stage = '', search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT w.*, u.full_name, u.email, u.current_stage, u.phone
      FROM withdrawals w
      JOIN users u ON w.user_id = u.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) FROM withdrawals w JOIN users u ON w.user_id = u.id WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND w.status = $${paramIndex}`;
      countQuery += ` AND w.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (stage) {
      query += ` AND u.current_stage = $${paramIndex}`;
      countQuery += ` AND u.current_stage = $${paramIndex}`;
      params.push(stage);
      paramIndex++;
    }

    if (search) {
      query += ` AND (u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      countQuery += ` AND (u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY w.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const [withdrawals, count] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);

    res.json({
      withdrawals: withdrawals.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(count.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update withdrawal status
      const withdrawalResult = await client.query(
        'UPDATE withdrawals SET status = $1, admin_notes = $2, processed_at = CURRENT_TIMESTAMP, processed_by = $3 WHERE id = $4 RETURNING *',
        [status, admin_notes, req.admin.id, id]
      );

      if (withdrawalResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Withdrawal request not found' });
      }

      const withdrawal = withdrawalResult.rows[0];

      // If approved, create transaction record
      if (status === 'approved') {
        await client.query(
          'INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5)',
          [withdrawal.user_id, 'withdrawal', -withdrawal.amount, `Withdrawal approved - ${withdrawal.id}`, 'completed']
        );
      }

      // Log admin activity
      await client.query(
        'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
        [req.admin.id, 'update_withdrawal', `Updated withdrawal ${id} status to ${status}`]
      );

      await client.query('COMMIT');
      res.json({ withdrawal: withdrawalResult.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update withdrawal error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const bulkApproveWithdrawals = async (req, res) => {
  try {
    const { withdrawalIds, admin_notes = '' } = req.body;

    if (!withdrawalIds || !Array.isArray(withdrawalIds) || withdrawalIds.length === 0) {
      return res.status(400).json({ message: 'Withdrawal IDs are required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get withdrawal details
      const placeholders = withdrawalIds.map((_, index) => `$${index + 1}`).join(',');
      const withdrawals = await client.query(
        `SELECT * FROM withdrawals WHERE id IN (${placeholders}) AND status = 'pending'`,
        withdrawalIds
      );

      if (withdrawals.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'No pending withdrawals found' });
      }

      // Update all withdrawals to approved
      await client.query(
        `UPDATE withdrawals SET status = 'approved', admin_notes = $1, processed_at = CURRENT_TIMESTAMP, processed_by = $2 WHERE id IN (${placeholders})`,
        [admin_notes, req.admin.id, ...withdrawalIds]
      );

      // Create transaction records for each withdrawal
      for (const withdrawal of withdrawals.rows) {
        await client.query(
          'INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5)',
          [withdrawal.user_id, 'withdrawal', -withdrawal.amount, `Bulk withdrawal approved - ${withdrawal.id}`, 'completed']
        );
      }

      // Log admin activity
      await client.query(
        'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
        [req.admin.id, 'bulk_approve_withdrawals', `Bulk approved ${withdrawals.rows.length} withdrawals`]
      );

      await client.query('COMMIT');
      res.json({ 
        message: `${withdrawals.rows.length} withdrawals approved successfully`,
        approvedCount: withdrawals.rows.length
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Bulk approve withdrawals error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getWithdrawalStats = async (req, res) => {
  try {
    const [pendingStats, approvedStats, rejectedStats, totalStats, repurchaseStats] = await Promise.all([
      pool.query('SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM withdrawals WHERE status = $1', ['pending']),
      pool.query('SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM withdrawals WHERE status = $1', ['approved']),
      pool.query('SELECT COUNT(*) as count FROM withdrawals WHERE status = $1', ['rejected']),
      pool.query('SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM withdrawals'),
      pool.query('SELECT COUNT(*) as count FROM withdrawals w JOIN users u ON w.user_id = u.id WHERE w.status = $1 AND u.repurchase_required = true', ['pending'])
    ]);

    res.json({
      pending: {
        count: parseInt(pendingStats.rows[0].count),
        amount: parseFloat(pendingStats.rows[0].total)
      },
      approved: {
        count: parseInt(approvedStats.rows[0].count),
        amount: parseFloat(approvedStats.rows[0].total)
      },
      rejected: {
        count: parseInt(rejectedStats.rows[0].count)
      },
      total: {
        count: parseInt(totalStats.rows[0].count),
        amount: parseFloat(totalStats.rows[0].total)
      },
      repurchaseRequired: parseInt(repurchaseStats.rows[0].count)
    });
  } catch (error) {
    console.error('Get withdrawal stats error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { getWithdrawals, updateWithdrawalStatus, bulkApproveWithdrawals, getWithdrawalStats };