const pool = require('../config/database');

const getEmailList = async (req, res) => {
  try {
    const { category = 'all' } = req.query;
    
    let query = 'SELECT id, email, full_name, status, created_at FROM users WHERE is_active = true';
    const params = [];
    
    if (category !== 'all') {
      query += ' AND status = $1';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ emails: result.rows });
  } catch (error) {
    console.error('Get email list error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const sendEmail = async (req, res) => {
  try {
    const { recipients, subject, message, category = 'all' } = req.body;
    
    // Get recipient list based on category
    let recipientQuery = 'SELECT id, email, full_name FROM users WHERE is_active = true';
    const params = [];
    
    if (category !== 'all') {
      recipientQuery += ' AND status = $1';
      params.push(category);
    }
    
    const recipientResult = await pool.query(recipientQuery, params);
    const recipientList = recipientResult.rows;
    
    // Store email in history
    const emailResult = await pool.query(
      'INSERT INTO email_history (admin_id, subject, message, recipient_category, recipient_count, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.admin.id, subject, message, category, recipientList.length, 'sent']
    );
    
    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'send_email', `Sent email to ${recipientList.length} recipients: ${subject}`]
    );
    
    res.json({ 
      message: `Email sent to ${recipientList.length} recipients`,
      emailId: emailResult.rows[0].id,
      recipientCount: recipientList.length
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getEmailHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const [emails, count] = await Promise.all([
      pool.query(
        'SELECT * FROM email_history ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      ),
      pool.query('SELECT COUNT(*) FROM email_history')
    ]);
    
    res.json({
      emails: emails.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(count.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Get email history error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const removeUserFromList = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE users SET email_subscribed = false WHERE id = $1 RETURNING email',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'remove_user_email', `Removed user from email list: ${result.rows[0].email}`]
    );
    
    res.json({ message: 'User removed from email list' });
  } catch (error) {
    console.error('Remove user error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { getEmailList, sendEmail, getEmailHistory, removeUserFromList };