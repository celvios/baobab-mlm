const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT u.id, u.full_name, u.email, u.phone, u.status, u.current_stage, u.created_at, u.is_active,
                        COALESCE(SUM(o.total_amount), 0) as total_orders
                 FROM users u
                 LEFT JOIN orders o ON u.id = o.user_id
                 WHERE 1=1`;
    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      countQuery += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      countQuery += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` GROUP BY u.id, u.full_name, u.email, u.phone, u.status, u.current_stage, u.created_at, u.is_active
               ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const countParams = params.slice(0, paramIndex - 1);
    const [users, count] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);

    res.json({
      users: users.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(count.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [user, orders, transactions, teamMembers] = await Promise.all([
      pool.query('SELECT * FROM users WHERE id = $1', [id]),
      pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [id]),
      pool.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [id]),
      pool.query('SELECT id, full_name, current_stage, total_earnings FROM users WHERE referrer_id = $1', [id])
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: user.rows[0],
      orders: orders.rows,
      transactions: transactions.rows,
      teamMembers: teamMembers.rows
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { full_name, email, phone, password, current_stage = 'feeder' } = req.body;

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (full_name, email, phone, password, current_stage, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [full_name, email, phone, hashedPassword, current_stage, 'active']
    );

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'create_user', `Created user: ${email}`]
    );

    const { password: _, ...userWithoutPassword } = result.rows[0];
    res.status(201).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, current_stage, status, is_active } = req.body;

    const result = await pool.query(
      'UPDATE users SET full_name = $1, email = $2, phone = $3, current_stage = $4, status = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [full_name, email, phone, current_stage, status, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'update_user', `Updated user: ${email}`]
    );

    const { password: _, ...userWithoutPassword } = result.rows[0];
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING email',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'deactivate_user', `Deactivated user: ${result.rows[0].email}`]
    );

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { getUsers, getUserDetails, createUser, updateUser, deactivateUser };