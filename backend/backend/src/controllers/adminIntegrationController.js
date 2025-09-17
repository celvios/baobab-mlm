const pool = require('../config/database');
const axios = require('axios');

const getPaymentGateways = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payment_gateways ORDER BY is_active DESC, name ASC');
    res.json({ gateways: result.rows });
  } catch (error) {
    console.error('Get payment gateways error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updatePaymentGateway = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, config, is_active } = req.body;

    const result = await pool.query(
      'UPDATE payment_gateways SET name = $1, config = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, JSON.stringify(config), is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Payment gateway not found' });
    }

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'update_payment_gateway', `Updated payment gateway: ${name}`]
    );

    res.json({ gateway: result.rows[0] });
  } catch (error) {
    console.error('Update payment gateway error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getEmailServices = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM email_services ORDER BY is_active DESC, name ASC');
    res.json({ services: result.rows });
  } catch (error) {
    console.error('Get email services error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateEmailService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, config, is_active } = req.body;

    const result = await pool.query(
      'UPDATE email_services SET name = $1, config = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, JSON.stringify(config), is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Email service not found' });
    }

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'update_email_service', `Updated email service: ${name}`]
    );

    res.json({ service: result.rows[0] });
  } catch (error) {
    console.error('Update email service error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const testEmailService = async (req, res) => {
  try {
    const { service_id, test_email } = req.body;

    const service = await pool.query('SELECT * FROM email_services WHERE id = $1', [service_id]);
    if (service.rows.length === 0) {
      return res.status(404).json({ message: 'Email service not found' });
    }

    // Test email sending (mock implementation)
    const testResult = {
      success: true,
      message: 'Test email sent successfully',
      timestamp: new Date().toISOString()
    };

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'test_email_service', `Tested email service to: ${test_email}`]
    );

    res.json(testResult);
  } catch (error) {
    console.error('Test email service error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getSystemHealth = async (req, res) => {
  try {
    const [dbHealth, memoryUsage] = await Promise.all([
      pool.query('SELECT NOW() as timestamp'),
      Promise.resolve(process.memoryUsage())
    ]);

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        responseTime: Date.now() - new Date(dbHealth.rows[0].timestamp).getTime()
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      uptime: Math.round(process.uptime())
    };

    res.json(health);
  } catch (error) {
    console.error('System health check error:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

const optimizeDatabase = async (req, res) => {
  try {
    // Run basic database optimization queries
    await Promise.all([
      pool.query('VACUUM ANALYZE users'),
      pool.query('VACUUM ANALYZE orders'),
      pool.query('VACUUM ANALYZE transactions'),
      pool.query('VACUUM ANALYZE admin_activity_logs')
    ]);

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'optimize_database', 'Ran database optimization']
    );

    res.json({ 
      message: 'Database optimization completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database optimization error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { getPaymentGateways, updatePaymentGateway, getEmailServices, updateEmailService, testEmailService, getSystemHealth, optimizeDatabase };