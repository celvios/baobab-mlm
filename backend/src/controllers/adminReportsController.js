const pool = require('../config/database');

const getSalesReport = async (req, res) => {
  try {
    const { start_date, end_date, period = 'daily' } = req.query;
    
    let dateFormat, groupBy;
    switch (period) {
      case 'monthly':
        dateFormat = 'YYYY-MM';
        groupBy = 'DATE_TRUNC(\'month\', created_at)';
        break;
      case 'weekly':
        dateFormat = 'YYYY-"W"WW';
        groupBy = 'DATE_TRUNC(\'week\', created_at)';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
        groupBy = 'DATE(created_at)';
    }

    let query = `
      SELECT 
        TO_CHAR(${groupBy}, '${dateFormat}') as period,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as total_sales,
        COALESCE(AVG(total_amount), 0) as avg_order_value
      FROM orders 
      WHERE payment_status = 'completed'
    `;
    
    const params = [];
    let paramIndex = 1;

    if (start_date) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    query += ` GROUP BY ${groupBy} ORDER BY ${groupBy} DESC`;

    const result = await pool.query(query, params);
    res.json({ salesReport: result.rows });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getUserAnalytics = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let baseQuery = 'FROM users WHERE is_active = true';
    const params = [];
    let paramIndex = 1;

    if (start_date) {
      baseQuery += ` AND created_at >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      baseQuery += ` AND created_at <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    const [registrations, stageDistribution, topReferrers] = await Promise.all([
      pool.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        ${baseQuery} 
        GROUP BY DATE(created_at) 
        ORDER BY date DESC
      `, params),
      pool.query(`
        SELECT current_stage, COUNT(*) as count 
        ${baseQuery} 
        GROUP BY current_stage
      `, params),
      pool.query(`
        SELECT u.full_name, u.email, COUNT(r.id) as referral_count
        FROM users u
        LEFT JOIN users r ON u.id = r.referrer_id
        WHERE u.is_active = true
        GROUP BY u.id, u.full_name, u.email
        HAVING COUNT(r.id) > 0
        ORDER BY referral_count DESC
        LIMIT 10
      `)
    ]);

    res.json({
      registrations: registrations.rows,
      stageDistribution: stageDistribution.rows,
      topReferrers: topReferrers.rows
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getCommissionReport = async (req, res) => {
  try {
    const { start_date, end_date, user_id } = req.query;
    
    let query = `
      SELECT 
        t.*, 
        u.full_name, 
        u.email, 
        u.current_stage
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.type = 'commission'
    `;
    
    const params = [];
    let paramIndex = 1;

    if (start_date) {
      query += ` AND t.created_at >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND t.created_at <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    if (user_id) {
      query += ` AND t.user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }

    query += ' ORDER BY t.created_at DESC';

    const [commissions, summary] = await Promise.all([
      pool.query(query, params),
      pool.query(`
        SELECT 
          COUNT(*) as total_transactions,
          COALESCE(SUM(amount), 0) as total_commissions,
          COALESCE(AVG(amount), 0) as avg_commission
        FROM transactions 
        WHERE type = 'commission'
        ${start_date ? `AND created_at >= '${start_date}'` : ''}
        ${end_date ? `AND created_at <= '${end_date}'` : ''}
        ${user_id ? `AND user_id = ${user_id}` : ''}
      `)
    ]);

    res.json({
      commissions: commissions.rows,
      summary: summary.rows[0]
    });
  } catch (error) {
    console.error('Commission report error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const exportData = async (req, res) => {
  try {
    const { type, format = 'json', start_date, end_date } = req.query;
    
    let query, filename;
    const params = [];
    let paramIndex = 1;

    switch (type) {
      case 'users':
        query = 'SELECT * FROM users WHERE is_active = true';
        filename = 'users_export';
        break;
      case 'orders':
        query = 'SELECT o.*, u.full_name, u.email FROM orders o JOIN users u ON o.user_id = u.id WHERE 1=1';
        filename = 'orders_export';
        break;
      case 'transactions':
        query = 'SELECT t.*, u.full_name, u.email FROM transactions t JOIN users u ON t.user_id = u.id WHERE 1=1';
        filename = 'transactions_export';
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    if (start_date) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    
    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'export_data', `Exported ${type} data (${result.rows.length} records)`]
    );

    if (format === 'csv') {
      // Convert to CSV format
      if (result.rows.length === 0) {
        return res.json({ message: 'No data to export' });
      }

      const headers = Object.keys(result.rows[0]).join(',');
      const csvData = result.rows.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',')
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(headers + '\n' + csvData);
    } else {
      res.json({ 
        data: result.rows,
        count: result.rows.length,
        exportedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { getSalesReport, getUserAnalytics, getCommissionReport, exportData };