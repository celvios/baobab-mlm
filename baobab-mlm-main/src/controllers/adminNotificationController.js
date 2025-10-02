const pool = require('../config/database');

const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, type = '', read = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM admin_notifications WHERE admin_id = $1';
    let countQuery = 'SELECT COUNT(*) FROM admin_notifications WHERE admin_id = $1';
    const params = [req.admin.id];
    let paramIndex = 2;

    if (type) {
      query += ` AND type = $${paramIndex}`;
      countQuery += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (read !== '') {
      const isRead = read === 'true';
      query += ` AND is_read = $${paramIndex}`;
      countQuery += ` AND is_read = $${paramIndex}`;
      params.push(isRead);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const [notifications, count] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);

    res.json({
      notifications: notifications.rows,
      total: parseInt(count.rows[0].count),
      unreadCount: notifications.rows.filter(n => !n.is_read).length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE admin_notifications SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE id = $1 AND admin_id = $2 RETURNING *',
      [id, req.admin.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ notification: result.rows[0] });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE admin_notifications SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE admin_id = $1 AND is_read = false',
      [req.admin.id]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const createNotification = async (adminId, type, title, message, data = null) => {
  try {
    await pool.query(
      'INSERT INTO admin_notifications (admin_id, type, title, message, data) VALUES ($1, $2, $3, $4, $5)',
      [adminId, type, title, message, JSON.stringify(data)]
    );
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM admin_notifications WHERE id = $1 AND admin_id = $2 RETURNING *',
      [id, req.admin.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getNotificationSettings = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM admin_notification_settings WHERE admin_id = $1',
      [req.admin.id]
    );

    if (result.rows.length === 0) {
      // Create default settings
      const defaultSettings = {
        email_notifications: true,
        push_notifications: true,
        new_orders: true,
        new_users: true,
        withdrawal_requests: true,
        system_alerts: true
      };

      const insertResult = await pool.query(
        'INSERT INTO admin_notification_settings (admin_id, email_notifications, push_notifications, new_orders, new_users, withdrawal_requests, system_alerts) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [req.admin.id, defaultSettings.email_notifications, defaultSettings.push_notifications, defaultSettings.new_orders, defaultSettings.new_users, defaultSettings.withdrawal_requests, defaultSettings.system_alerts]
      );

      return res.json({ settings: insertResult.rows[0] });
    }

    res.json({ settings: result.rows[0] });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateNotificationSettings = async (req, res) => {
  try {
    const { email_notifications, push_notifications, new_orders, new_users, withdrawal_requests, system_alerts } = req.body;

    const result = await pool.query(
      'UPDATE admin_notification_settings SET email_notifications = $1, push_notifications = $2, new_orders = $3, new_users = $4, withdrawal_requests = $5, system_alerts = $6, updated_at = CURRENT_TIMESTAMP WHERE admin_id = $7 RETURNING *',
      [email_notifications, push_notifications, new_orders, new_users, withdrawal_requests, system_alerts, req.admin.id]
    );

    res.json({ settings: result.rows[0] });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification, deleteNotification, getNotificationSettings, updateNotificationSettings };