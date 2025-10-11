const pool = require('../config/database');
const nodemailer = require('nodemailer');
const { createEmailTemplate } = require('../utils/emailTemplates');

// Email transporter setup
let transporter;
try {
  transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} catch (error) {
  console.error('Email transporter setup failed:', error);
}

const getEmailList = async (req, res) => {
  try {
    const { category = 'all', search = '' } = req.query;
    
    let query = `
      SELECT u.id, u.email, u.full_name, u.current_stage, u.created_at, u.is_active,
             COUNT(ref.id) as referral_count
      FROM users u
      LEFT JOIN users ref ON ref.referred_by = u.referral_code
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    
    if (category !== 'all') {
      query += ` AND u.current_stage = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ` GROUP BY u.id, u.email, u.full_name, u.current_stage, u.created_at, u.is_active
               ORDER BY u.created_at DESC LIMIT 1000`;
    
    const result = await pool.query(query, params);
    
    res.json({ 
      emails: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get email list error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const sendEmail = async (req, res) => {
  try {
    const { subject, message, category = 'all', selectedUsers = [] } = req.body;
    
    if (!transporter) {
      return res.status(500).json({ message: 'Email service not configured' });
    }
    
    // Get recipient list based on category or selected users
    let recipientQuery, params;
    
    if (selectedUsers.length > 0) {
      // Send to specific selected users
      recipientQuery = 'SELECT id, email, full_name FROM users WHERE id = ANY($1)';
      params = [selectedUsers];
    } else {
      // Send to category
      recipientQuery = 'SELECT id, email, full_name FROM users WHERE 1=1';
      params = [];
      
      if (category !== 'all') {
        recipientQuery += ' AND current_stage = $1';
        params.push(category);
      }
    }
    
    const recipientResult = await pool.query(recipientQuery, params);
    const recipientList = recipientResult.rows;
    
    if (recipientList.length === 0) {
      return res.status(400).json({ message: 'No recipients found' });
    }
    
    // Store email in history first
    const emailResult = await pool.query(
      'INSERT INTO email_history (admin_id, subject, message, recipient_category, recipient_count, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.admin.id, subject, message, category, recipientList.length, 'sending']
    );
    
    const emailId = emailResult.rows[0].id;
    let successCount = 0;
    let failedCount = 0;
    
    // Send emails to all recipients
    for (const recipient of recipientList) {
      try {
        const emailHtml = createEmailTemplate(subject, message, recipient.full_name || 'Valued Member');
        
        await transporter.sendMail({
          from: {
            name: 'Baobab MLM',
            address: process.env.EMAIL_USER
          },
          to: recipient.email,
          subject: subject,
          html: emailHtml
        });
        
        successCount++;
        console.log(`Email sent successfully to: ${recipient.email}`);
      } catch (emailError) {
        console.error(`Failed to send email to ${recipient.email}:`, emailError);
        failedCount++;
      }
    }
    
    // Update email history with final status
    const finalStatus = failedCount === 0 ? 'sent' : (successCount === 0 ? 'failed' : 'partial');
    await pool.query(
      'UPDATE email_history SET status = $1, sent_count = $2, failed_count = $3 WHERE id = $4',
      [finalStatus, successCount, failedCount, emailId]
    );
    
    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'send_email', `Sent email "${subject}" to ${successCount}/${recipientList.length} recipients`]
    );
    
    res.json({ 
      message: `Email sent to ${successCount} of ${recipientList.length} recipients`,
      emailId: emailId,
      successCount: successCount,
      failedCount: failedCount,
      totalRecipients: recipientList.length
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
      pool.query(`
        SELECT eh.*, a.name as admin_name
        FROM email_history eh
        LEFT JOIN admins a ON eh.admin_id = a.id
        ORDER BY eh.created_at DESC 
        LIMIT $1 OFFSET $2
      `, [limit, offset]),
      pool.query('SELECT COUNT(*) FROM email_history')
    ]);
    
    res.json({
      emails: emails.rows.map(email => ({
        id: email.id,
        subject: email.subject,
        message: email.message,
        recipientCategory: email.recipient_category,
        recipientCount: email.recipient_count,
        sentCount: email.sent_count || email.recipient_count,
        failedCount: email.failed_count || 0,
        status: email.status,
        adminName: email.admin_name,
        createdAt: email.created_at
      })),
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
      'UPDATE users SET is_active = false WHERE id = $1 RETURNING email, full_name',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details, user_id) VALUES ($1, $2, $3, $4)',
      [req.admin.id, 'remove_user_email', `Removed ${result.rows[0].full_name} (${result.rows[0].email}) from email list`, id]
    );
    
    res.json({ message: 'User removed from email list successfully' });
  } catch (error) {
    console.error('Remove user error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const testEmailConnection = async (req, res) => {
  try {
    if (!transporter) {
      return res.status(500).json({ message: 'Email service not configured' });
    }
    
    await transporter.verify();
    res.json({ message: 'Email connection successful' });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ message: 'Email connection failed: ' + error.message });
  }
};

module.exports = { getEmailList, sendEmail, getEmailHistory, removeUserFromList, testEmailConnection };