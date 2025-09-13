const pool = require('../config/database');

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      productName, 
      productPrice, 
      quantity = 1, 
      deliveryType = 'pickup',
      deliveryAddress,
      pickupStation = 'Ikeja High Tower, Lagos'
    } = req.body;

    if (!productName || !productPrice) {
      return res.status(400).json({ message: 'Product name and price are required' });
    }

    const totalAmount = productPrice * quantity;
    
    // Generate unique order number
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const result = await pool.query(`
      INSERT INTO orders (
        user_id, order_number, product_name, product_price, quantity, 
        total_amount, delivery_type, delivery_address, pickup_station
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *
    `, [
      userId, orderNumber, productName, productPrice, quantity,
      totalAmount, deliveryType, deliveryAddress, pickupStation
    ]);

    const order = result.rows[0];

    // Create transaction record
    await pool.query(`
      INSERT INTO transactions (user_id, type, amount, description, status)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      userId, 
      'product_purchase', 
      -totalAmount, 
      `Product purchase: ${productName}`,
      'pending'
    ]);

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.order_number,
        productName: order.product_name,
        productPrice: parseFloat(order.product_price),
        quantity: order.quantity,
        totalAmount: parseFloat(order.total_amount),
        deliveryType: order.delivery_type,
        deliveryAddress: order.delivery_address,
        pickupStation: order.pickup_station,
        paymentStatus: order.payment_status,
        orderStatus: order.order_status,
        createdAt: order.created_at
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT * FROM orders 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    const countResult = await pool.query('SELECT COUNT(*) FROM orders WHERE user_id = $1', [userId]);
    const total = parseInt(countResult.rows[0].count);

    const orders = result.rows.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      productName: order.product_name,
      productPrice: parseFloat(order.product_price),
      quantity: order.quantity,
      totalAmount: parseFloat(order.total_amount),
      deliveryType: order.delivery_type,
      deliveryAddress: order.delivery_address,
      pickupStation: order.pickup_station,
      paymentStatus: order.payment_status,
      orderStatus: order.order_status,
      paymentReference: order.payment_reference,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    }));

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const result = await pool.query(`
      SELECT * FROM orders 
      WHERE id = $1 AND user_id = $2
    `, [orderId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = result.rows[0];
    res.json({
      id: order.id,
      orderNumber: order.order_number,
      productName: order.product_name,
      productPrice: parseFloat(order.product_price),
      quantity: order.quantity,
      totalAmount: parseFloat(order.total_amount),
      deliveryType: order.delivery_type,
      deliveryAddress: order.delivery_address,
      pickupStation: order.pickup_station,
      paymentStatus: order.payment_status,
      orderStatus: order.order_status,
      paymentReference: order.payment_reference,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    const { orderStatus, paymentStatus, paymentReference } = req.body;

    const result = await pool.query(`
      UPDATE orders 
      SET order_status = COALESCE($1, order_status),
          payment_status = COALESCE($2, payment_status),
          payment_reference = COALESCE($3, payment_reference),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND user_id = $5
      RETURNING *
    `, [orderStatus, paymentStatus, paymentReference, orderId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = result.rows[0];
    res.json({
      message: 'Order updated successfully',
      order: {
        id: order.id,
        orderNumber: order.order_number,
        orderStatus: order.order_status,
        paymentStatus: order.payment_status,
        paymentReference: order.payment_reference,
        updatedAt: order.updated_at
      }
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const result = await pool.query(`
      DELETE FROM orders 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [orderId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};