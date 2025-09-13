const pool = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    // Get basic stats
    const [usersResult, ordersResult, productsResult, earningsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as total_users FROM users WHERE is_active = true'),
      pool.query('SELECT COUNT(*) as total_orders, COALESCE(SUM(total_amount), 0) as total_sales FROM orders'),
      pool.query('SELECT COUNT(*) as total_products FROM products WHERE is_active = true'),
      pool.query('SELECT COALESCE(SUM(amount), 0) as today_earnings FROM transactions WHERE DATE(created_at) = CURRENT_DATE AND type = \'commission\'')
    ]);

    // Get recent orders
    const recentOrders = await pool.query(`
      SELECT o.id, o.order_number, o.product_name, o.total_amount, o.order_status, 
             o.created_at, u.full_name as customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    // Get sales chart data (last 7 days)
    const salesChart = await pool.query(`
      SELECT DATE(created_at) as date, COALESCE(SUM(total_amount), 0) as amount
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Get earnings chart data (last 7 days)
    const earningsChart = await pool.query(`
      SELECT DATE(created_at) as date, COALESCE(SUM(amount), 0) as amount
      FROM transactions
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' AND type = 'commission'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    res.json({
      stats: {
        totalUsers: parseInt(usersResult.rows[0].total_users),
        totalOrders: parseInt(ordersResult.rows[0].total_orders),
        totalSales: parseFloat(ordersResult.rows[0].total_sales),
        totalProducts: parseInt(productsResult.rows[0].total_products),
        todayEarnings: parseFloat(earningsResult.rows[0].today_earnings)
      },
      recentOrders: recentOrders.rows,
      salesChart: salesChart.rows,
      earningsChart: earningsChart.rows
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { getDashboardStats };