const pool = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    // Get comprehensive stats from user dashboard data sources
    const [
      usersResult, 
      ordersResult, 
      productsResult, 
      earningsResult, 
      revenueResult,
      withdrawalRequestsResult,
      pendingPaymentsResult,
      totalWalletBalanceResult,
      mlmEarningsResult
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as total_users FROM users WHERE is_active = true'),
      pool.query('SELECT COUNT(*) as total_orders, COALESCE(SUM(total_amount), 0) as total_sales FROM orders'),
      pool.query('SELECT COUNT(*) as total_products FROM products WHERE is_active = true'),
      pool.query('SELECT COALESCE(SUM(amount), 0) as today_earnings FROM transactions WHERE DATE(created_at) = CURRENT_DATE AND type = \'commission\''),
      pool.query('SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE order_status = \'completed\''),
      pool.query('SELECT COUNT(*) as pending_withdrawals, COALESCE(SUM(amount), 0) as total_withdrawal_amount FROM withdrawal_requests WHERE status = \'pending\''),
      pool.query('SELECT COUNT(*) as pending_payments FROM payment_confirmations WHERE status = \'pending\''),
      pool.query('SELECT COALESCE(SUM(balance), 0) as total_wallet_balance FROM wallets'),
      pool.query('SELECT COALESCE(SUM(total_earned), 0) as total_mlm_earnings FROM wallets')
    ]);

    // Get recent orders with user details
    const recentOrders = await pool.query(`
      SELECT o.id, o.order_number, p.name as product_name, o.total_amount, o.order_status, 
             o.created_at, u.full_name as customer_name, u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN products p ON o.product_id = p.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    // Get recent withdrawal requests (cashout requests)
    const recentWithdrawals = await pool.query(`
      SELECT wr.id, wr.amount, wr.status, wr.created_at, u.full_name, u.email,
             up.bank_name, up.account_number, up.account_name
      FROM withdrawal_requests wr
      JOIN users u ON wr.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      ORDER BY wr.created_at DESC
      LIMIT 10
    `);

    // Get sales dynamics (last 7 days)
    const salesDynamics = await pool.query(`
      SELECT DATE(created_at) as date, 
             COUNT(*) as orders_count,
             COALESCE(SUM(total_amount), 0) as daily_sales
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Get user registration dynamics (last 7 days)
    const userGrowth = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as new_users
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Get MLM earnings breakdown
    const mlmBreakdown = await pool.query(`
      SELECT t.type, COALESCE(SUM(t.amount), 0) as total_amount, COUNT(*) as transaction_count
      FROM transactions t
      WHERE t.type IN ('commission', 'referral_bonus', 'level_bonus')
      GROUP BY t.type
    `);

    // Get business info from settings
    const businessInfo = await pool.query(`
      SELECT key, value FROM settings 
      WHERE key IN ('business_name', 'business_email', 'business_phone', 'business_address', 'bank_name', 'account_number')
    `);

    const businessData = {};
    businessInfo.rows.forEach(setting => {
      businessData[setting.key] = setting.value;
    });

    res.json({
      success: true,
      stats: {
        totalUsers: parseInt(usersResult.rows[0].total_users),
        totalOrders: parseInt(ordersResult.rows[0].total_orders),
        totalSales: parseFloat(ordersResult.rows[0].total_sales),
        totalRevenue: parseFloat(revenueResult.rows[0].total_revenue),
        totalProducts: parseInt(productsResult.rows[0].total_products),
        todayEarnings: parseFloat(earningsResult.rows[0].today_earnings),
        pendingWithdrawals: parseInt(withdrawalRequestsResult.rows[0].pending_withdrawals),
        totalWithdrawalAmount: parseFloat(withdrawalRequestsResult.rows[0].total_withdrawal_amount),
        pendingPayments: parseInt(pendingPaymentsResult.rows[0].pending_payments),
        totalWalletBalance: parseFloat(totalWalletBalanceResult.rows[0].total_wallet_balance),
        totalMlmEarnings: parseFloat(mlmEarningsResult.rows[0].total_mlm_earnings)
      },
      recentOrders: recentOrders.rows,
      recentWithdrawals: recentWithdrawals.rows,
      salesDynamics: salesDynamics.rows,
      userGrowth: userGrowth.rows,
      mlmBreakdown: mlmBreakdown.rows,
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