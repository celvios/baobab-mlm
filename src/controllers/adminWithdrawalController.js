const pool = require('../config/database');

const getWithdrawalRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT wr.id, wr.amount, wr.status, wr.created_at, wr.processed_at, wr.admin_notes,
             u.full_name, u.email, u.phone,
             up.bank_name, up.account_number, up.account_name,
             w.balance as current_balance
      FROM withdrawal_requests wr
      JOIN users u ON wr.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE 1=1
    `;
    
    let countQuery = 'SELECT COUNT(*) FROM withdrawal_requests wr WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND wr.status = $${paramIndex}`;
      countQuery += ` AND wr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY wr.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const [requests, count] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);

    res.json({
      requests: requests.rows.map(r => ({
        id: r.id,
        amount: parseFloat(r.amount),
        status: r.status,
        createdAt: r.created_at,
        processedAt: r.processed_at,
        adminNotes: r.admin_notes,
        user: {
          fullName: r.full_name,
          email: r.email,
          phone: r.phone,
          currentBalance: parseFloat(r.current_balance || 0)
        },
        bankDetails: {
          bankName: r.bank_name,
          accountNumber: r.account_number,
          accountName: r.account_name
        }
      })),
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(count.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Get withdrawal requests error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const processWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes = '' } = req.body;
    const adminId = req.admin.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved or rejected' });
    }

    // Get withdrawal request details
    const withdrawalResult = await pool.query(`
      SELECT wr.*, u.full_name, u.email, w.balance
      FROM withdrawal_requests wr
      JOIN users u ON wr.user_id = u.id
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE wr.id = $1
    `, [id]);

    if (withdrawalResult.rows.length === 0) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    const withdrawal = withdrawalResult.rows[0];
    const userId = withdrawal.user_id;
    const amount = parseFloat(withdrawal.amount);

    if (status === 'approved') {
      // Check if user has sufficient balance
      const currentBalance = parseFloat(withdrawal.balance || 0);
      if (currentBalance < amount) {
        return res.status(400).json({ message: 'User has insufficient balance' });
      }

      // Deduct from wallet
      await pool.query('UPDATE wallets SET balance = balance - $1, total_withdrawn = total_withdrawn + $1 WHERE user_id = $2', [amount, userId]);

      // Create transaction record
      await pool.query(`
        INSERT INTO transactions (user_id, type, amount, description, status, admin_id, reference)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [userId, 'debit', amount, `Withdrawal approved: ${adminNotes}`, 'completed', adminId, `WD${id}`]);
    }

    // Update withdrawal request
    await pool.query(`
      UPDATE withdrawal_requests 
      SET status = $1, admin_notes = $2, processed_at = CURRENT_TIMESTAMP, admin_id = $3
      WHERE id = $4
    `, [status, adminNotes, adminId, id]);

    // Log admin activity
    await pool.query(`
      INSERT INTO admin_activity_logs (admin_id, action, details, user_id)
      VALUES ($1, $2, $3, $4)
    `, [adminId, `${status}_withdrawal`, `${status === 'approved' ? 'Approved' : 'Rejected'} withdrawal for ${withdrawal.full_name} (${withdrawal.email}) - ₦${amount.toLocaleString()}. Notes: ${adminNotes}`, userId]);

    res.json({
      message: `Withdrawal ${status} successfully`,
      withdrawalId: id,
      status: status
    });
  } catch (error) {
    console.error('Process withdrawal error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { getWithdrawalRequests, processWithdrawal };