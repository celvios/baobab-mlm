const pool = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    // Get basic stats
    const [usersResult, ordersResult, productsResult, earningsResult, revenueResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as total_users FROM users WHERE is_active = true'),
      pool.query('SELECT COUNT(*) as total_orders, COALESCE(SUM(total_amount), 0) as total_sales FROM orders'),
      pool.query('SELECT COUNT(*) as total_products FROM products WHERE is_active = true'),
      pool.query('SELECT COALESCE(SUM(amount), 0) as today_earnings FROM transactions WHERE DATE(created_at) = CURRENT_DATE AND type = \'commission\''),
      pool.query('SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE order_status = \'completed\'')
    ]);

    // Get recent orders with product names
    const recentOrders = await pool.query(`
      SELECT o.id, o.order_number, p.name as product_name, o.total_amount, o.order_status, 
             o.created_at, u.full_name as customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN products p ON o.product_id = p.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    // Get sales chart data (last 6 months)
    const salesChart = await pool.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as date, COALESCE(SUM(total_amount), 0) as value
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 months' AND order_status = 'completed'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY date
    `);

    // Get earnings chart data (last 7 days)
    const earningsChart = await pool.query(`
      SELECT TO_CHAR(created_at, 'Dy') as date, COALESCE(SUM(amount), 0) as value
      FROM transactions
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' AND type = 'commission'
      GROUP BY DATE(created_at), TO_CHAR(created_at, 'Dy')
      ORDER BY DATE(created_at)
    `);

    // Get business info from settings
    const businessInfo = await pool.query(`
      SELECT setting_key, setting_value FROM settings 
      WHERE setting_key IN ('business_name', 'business_email', 'business_phone', 'business_address', 'bank_name', 'account_number')
    `);

    const businessData = {};
    businessInfo.rows.forEach(setting => {
      businessData[setting.setting_key] = setting.setting_value;
    });

    res.json({
      success: true,
      stats: {
        totalUsers: parseInt(usersResult.rows[0].total_users),
        totalOrders: parseInt(ordersResult.rows[0].total_orders),
        totalSales: parseFloat(ordersResult.rows[0].total_sales),
        totalRevenue: parseFloat(revenueResult.rows[0].total_revenue),
        totalProducts: parseInt(productsResult.rows[0].total_products),
        todayEarnings: parseFloat(earningsResult.rows[0].today_earnings)
      },
      recentOrders: recentOrders.rows,
      salesChart: salesChart.rows,
      earningsChart: earningsChart.rows,
      businessInfo: {
        name: businessData.business_name || 'Baobab MLM Business',
        email: businessData.business_email || 'admin@baobabmlm.com',
        phone: businessData.business_phone || '+234-XXX-XXX-XXXX',
        address: businessData.business_address || 'Lagos, Nigeria',
        bankName: businessData.bank_name || 'Not configured',
        accountNumber: businessData.account_number || 'Not configured'
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = { getDashboardStats };