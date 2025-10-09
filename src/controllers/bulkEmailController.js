const pool = require('../config/database');
const sgMail = require('@sendgrid/mail');
const { createEmailTemplate, createAnnouncementTemplate, createPromotionTemplate } = require('../utils/emailTemplates');

// SendGrid setup
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@baobab.com';

const sendBulkEmail = async (req, res) => {
  try {
    const { subject, message, category = 'all', template = 'default', selectedUsers = [] } = req.body;
    
    if (!process.env.SENDGRID_API_KEY) {
      return res.status(500).json({ message: 'Email service not configured' });
    }

    // Get recipient list
    let recipientQuery, params;
    
    if (selectedUsers.length > 0) {
      recipientQuery = 'SELECT id, email, full_name, mlm_level FROM users WHERE id = ANY($1) AND is_active = true';
      params = [selectedUsers];
    } else {
      recipientQuery = 'SELECT id, email, full_name, mlm_level FROM users WHERE is_active = true';
      params = [];
      
      if (category !== 'all') {
        recipientQuery += ' AND mlm_level = $1';
        params.push(category);
      }
    }
    
    const recipientResult = await pool.query(recipientQuery, params);
    const recipientList = recipientResult.rows;
    
    if (recipientList.length === 0) {
      return res.status(400).json({ message: 'No recipients found' });
    }

    // Store email in history
    const emailResult = await pool.query(
      'INSERT INTO email_history (admin_id, subject, message, recipient_category, recipient_count, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.admin.id, subject, message, category, recipientList.length, 'sending']
    );
    
    const emailId = emailResult.rows[0].id;

    // Prepare email template based on type
    let emailHtml;
    switch (template) {
      case 'announcement':
        emailHtml = createAnnouncementTemplate(subject, message);
        break;
      case 'promotion':
        emailHtml = createPromotionTemplate(subject, message);
        break;
      default:
        emailHtml = createEmailTemplate(subject, message);
    }

    // Prepare bulk email data
    const emailPromises = recipientList.map(recipient => {
      const personalizedHtml = emailHtml.replace(/\{name\}/g, recipient.full_name || 'Valued Member');
      
      return sgMail.send({
        from: FROM_EMAIL,
        to: recipient.email,
        subject: subject,
        html: personalizedHtml
      }).then(() => {
        console.log(`Email sent successfully to: ${recipient.email}`);
        return { success: true, email: recipient.email };
      }).catch(error => {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        return { success: false, email: recipient.email, error: error.message };
      });
    });

    // Send all emails concurrently with batching
    const batchSize = 10;
    let successCount = 0;
    let failedCount = 0;
    const failedEmails = [];

    for (let i = 0; i < emailPromises.length; i += batchSize) {
      const batch = emailPromises.slice(i, i + batchSize);
      const results = await Promise.all(batch);
      
      results.forEach(result => {
        if (result.success) {
          successCount++;
        } else {
          failedCount++;
          failedEmails.push(result.email);
        }
      });

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < emailPromises.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update email history with results
    const finalStatus = failedCount === 0 ? 'sent' : (successCount === 0 ? 'failed' : 'partial');
    await pool.query(
      'UPDATE email_history SET status = $1, sent_count = $2, failed_count = $3 WHERE id = $4',
      [finalStatus, successCount, failedCount, emailId]
    );

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'bulk_email', `Bulk email "${subject}" sent to ${successCount}/${recipientList.length} recipients`]
    );

    res.json({
      message: `Bulk email completed: ${successCount} sent, ${failedCount} failed`,
      emailId: emailId,
      successCount: successCount,
      failedCount: failedCount,
      totalRecipients: recipientList.length,
      failedEmails: failedEmails.slice(0, 10) // Return first 10 failed emails
    });

  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getEmailStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_emails,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as successful_emails,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_emails,
        COUNT(CASE WHEN status = 'partial' THEN 1 END) as partial_emails,
        COALESCE(SUM(sent_count), 0) as total_sent,
        COALESCE(SUM(failed_count), 0) as total_failed,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as emails_this_week,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as emails_this_month
      FROM email_history
    `);

    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN mlm_level = 'feeder' THEN 1 END) as feeder_users,
        COUNT(CASE WHEN mlm_level = 'bronze' THEN 1 END) as bronze_users,
        COUNT(CASE WHEN mlm_level = 'silver' THEN 1 END) as silver_users,
        COUNT(CASE WHEN mlm_level = 'gold' THEN 1 END) as gold_users,
        COUNT(CASE WHEN mlm_level = 'diamond' THEN 1 END) as diamond_users
      FROM users
    `);

    res.json({
      emailStats: stats.rows[0],
      userStats: userStats.rows[0]
    });
  } catch (error) {
    console.error('Get email stats error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { sendBulkEmail, getEmailStats };