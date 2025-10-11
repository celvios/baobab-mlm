const pool = require('../config/database');

const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action = '', admin_id = '', start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        al.*, 
        a.name as admin_name, 
        a.email as admin_email
      FROM admin_activity_logs al
      JOIN admins a ON al.admin_id = a.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) FROM admin_activity_logs al WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (action) {
      query += ` AND al.action ILIKE $${paramIndex}`;
      countQuery += ` AND action ILIKE $${paramIndex}`;
      params.push(`%${action}%`);
      paramIndex++;
    }

    if (admin_id) {
      query += ` AND al.admin_id = $${paramIndex}`;
      countQuery += ` AND admin_id = $${paramIndex}`;
      params.push(admin_id);
      paramIndex++;
    }

    if (start_date) {
      query += ` AND al.created_at >= $${paramIndex}`;
      countQuery += ` AND created_at >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND al.created_at <= $${paramIndex}`;
      countQuery += ` AND created_at <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const countParams = params.slice(0, paramIndex - 1);
    const [logs, count] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);

    res.json({
      logs: logs.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(count.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getSystemLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, level = '', start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM system_logs WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM system_logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (level) {
      query += ` AND level = $${paramIndex}`;
      countQuery += ` AND level = $${paramIndex}`;
      params.push(level);
      paramIndex++;
    }

    if (start_date) {
      query += ` AND created_at >= $${paramIndex}`;
      countQuery += ` AND created_at >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND created_at <= $${paramIndex}`;
      countQuery += ` AND created_at <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const countParams = params.slice(0, paramIndex - 1);
    const [logs, count] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);

    res.json({
      logs: logs.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(count.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getSecurityEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20, event_type = '', severity = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM security_events WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM security_events WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (event_type) {
      query += ` AND event_type = $${paramIndex}`;
      countQuery += ` AND event_type = $${paramIndex}`;
      params.push(event_type);
      paramIndex++;
    }

    if (severity) {
      query += ` AND severity = $${paramIndex}`;
      countQuery += ` AND severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const countParams = params.slice(0, paramIndex - 1);
    const [events, count] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);

    res.json({
      events: events.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(count.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Get security events error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const logSystemEvent = async (level, message, details = null, userId = null) => {
  try {
    await pool.query(
      'INSERT INTO system_logs (level, message, details, user_id) VALUES ($1, $2, $3, $4)',
      [level, message, JSON.stringify(details), userId]
    );
  } catch (error) {
    console.error('Log system event error:', error);
  }
};

const logSecurityEvent = async (eventType, severity, message, ipAddress = null, userId = null, details = null) => {
  try {
    await pool.query(
      'INSERT INTO security_events (event_type, severity, message, ip_address, user_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
      [eventType, severity, message, ipAddress, userId, JSON.stringify(details)]
    );
  } catch (error) {
    console.error('Log security event error:', error);
  }
};

const getAuditStats = async (req, res) => {
  try {
    const [activityStats, systemStats, securityStats] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*) as total_activities,
          COUNT(DISTINCT admin_id) as active_admins,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_activities
        FROM admin_activity_logs
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_logs,
          COUNT(*) FILTER (WHERE level = 'error') as error_logs,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_logs
        FROM system_logs
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_events,
          COUNT(*) FILTER (WHERE severity = 'high') as high_severity,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_events
        FROM security_events
      `)
    ]);

    res.json({
      activities: activityStats.rows[0],
      systemLogs: systemStats.rows[0],
      securityEvents: securityStats.rows[0]
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { getActivityLogs, getSystemLogs, getSecurityEvents, logSystemEvent, logSecurityEvent, getAuditStats };