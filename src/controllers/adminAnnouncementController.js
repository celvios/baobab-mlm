const pool = require('../config/database');

const getAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 10, type = '', priority = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM announcements WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM announcements WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND type = $${paramIndex}`;
      countQuery += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (priority) {
      query += ` AND priority = $${paramIndex}`;
      countQuery += ` AND priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const [announcements, count] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);

    res.json({
      announcements: announcements.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(count.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, message, type, priority, is_active = true } = req.body;

    const result = await pool.query(
      'INSERT INTO announcements (title, message, type, priority, is_active, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, message, type, priority, is_active, req.admin.id]
    );

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'create_announcement', `Created announcement: ${title}`]
    );

    res.status(201).json({ announcement: result.rows[0] });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, type, priority, is_active } = req.body;

    const result = await pool.query(
      'UPDATE announcements SET title = $1, message = $2, type = $3, priority = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [title, message, type, priority, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'update_announcement', `Updated announcement: ${title}`]
    );

    res.json({ announcement: result.rows[0] });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM announcements WHERE id = $1 RETURNING title', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'delete_announcement', `Deleted announcement: ${result.rows[0].title}`]
    );

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const toggleAnnouncementStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE announcements SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'toggle_announcement', `Toggled announcement status: ${result.rows[0].title}`]
    );

    res.json({ announcement: result.rows[0] });
  } catch (error) {
    console.error('Toggle announcement error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getAnnouncementStats = async (req, res) => {
  try {
    const [total, active, highPriority, views] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM announcements'),
      pool.query('SELECT COUNT(*) as count FROM announcements WHERE is_active = true'),
      pool.query('SELECT COUNT(*) as count FROM announcements WHERE priority = $1', ['high']),
      pool.query('SELECT COALESCE(SUM(view_count), 0) as total FROM announcements WHERE DATE(created_at) = CURRENT_DATE')
    ]);

    res.json({
      totalAnnouncements: parseInt(total.rows[0].count),
      activeAnnouncements: parseInt(active.rows[0].count),
      highPriorityAnnouncements: parseInt(highPriority.rows[0].count),
      viewsToday: parseInt(views.rows[0].total)
    });
  } catch (error) {
    console.error('Get announcement stats error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, toggleAnnouncementStatus, getAnnouncementStats };