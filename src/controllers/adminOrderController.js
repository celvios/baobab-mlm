const pool = require('../config/database');

const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) FROM orders o JOIN users u ON o.user_id = u.id WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND o.order_status = $${paramIndex}`;
      countQuery += ` AND o.order_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (o.order_number ILIKE $${paramIndex} OR u.full_name ILIKE $${paramIndex} OR o.product_name ILIKE $${paramIndex})`;
      countQuery += ` AND (o.order_number ILIKE $${paramIndex} OR u.full_name ILIKE $${paramIndex} OR o.product_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const countParams = params.slice(0, paramIndex - 1);
    const [orders, count] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);

    res.json({
      orders: orders.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(count.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, payment_status } = req.body;

    const result = await pool.query(
      'UPDATE orders SET order_status = $1, payment_status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [order_status, payment_status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'update_order', `Updated order ${result.rows[0].order_number} status to ${order_status}`]
    );

    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const [totalOrders, pendingOrders, completedOrders, totalRevenue, todayOrders] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM orders'),
      pool.query('SELECT COUNT(*) as count FROM orders WHERE order_status = $1', ['pending']),
      pool.query('SELECT COUNT(*) as count FROM orders WHERE order_status = $1', ['delivered']),
      pool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = $1', ['completed']),
      pool.query('SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE DATE(created_at) = CURRENT_DATE')
    ]);

    res.json({
      totalOrders: parseInt(totalOrders.rows[0].count),
      pendingOrders: parseInt(pendingOrders.rows[0].count),
      completedOrders: parseInt(completedOrders.rows[0].count),
      totalRevenue: parseFloat(totalRevenue.rows[0].total),
      todayOrders: parseInt(todayOrders.rows[0].count),
      todayRevenue: parseFloat(todayOrders.rows[0].revenue)
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const bulkUpdateOrders = async (req, res) => {
  try {
    const { orderIds, order_status, payment_status } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: 'Order IDs are required' });
    }

    const placeholders = orderIds.map((_, index) => `$${index + 3}`).join(',');
    const query = `UPDATE orders SET order_status = $1, payment_status = $2, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders}) RETURNING id, order_number`;
    
    const result = await pool.query(query, [order_status, payment_status, ...orderIds]);

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'bulk_update_orders', `Bulk updated ${result.rows.length} orders to ${order_status}`]
    );

    res.json({ 
      message: `${result.rows.length} orders updated successfully`,
      updatedOrders: result.rows
    });
  } catch (error) {
    console.error('Bulk update orders error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { getOrders, updateOrderStatus, getOrderStats, bulkUpdateOrders };