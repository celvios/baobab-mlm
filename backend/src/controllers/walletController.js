const pool = require('../config/database');

const purchaseWithWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productName, productPrice, quantity = 1, deliveryType = 'pickup', pickupStation } = req.body;

    // Check user wallet balance
    const walletResult = await pool.query('SELECT balance FROM wallets WHERE user_id = $1', [userId]);
    if (walletResult.rows.length === 0) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const currentBalance = parseFloat(walletResult.rows[0].balance);
    const totalAmount = productPrice * quantity;

    if (currentBalance < totalAmount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Generate order number
    const orderNumber = `ORD${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create order
    const orderResult = await pool.query(`
      INSERT INTO orders (user_id, order_number, product_name, product_price, quantity, total_amount, 
                         delivery_type, pickup_station, payment_status, order_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [userId, orderNumber, productName, productPrice, quantity, totalAmount, 
        deliveryType, pickupStation, 'successful', 'confirmed']);

    // Deduct from wallet
    await pool.query(
      'UPDATE wallets SET balance = balance - $1 WHERE user_id = $2',
      [totalAmount, userId]
    );

    // Create transaction record
    await pool.query(`
      INSERT INTO transactions (user_id, type, amount, description, reference)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, 'debit', totalAmount, `Product purchase: ${productName}`, orderNumber]);

    res.json({
      message: 'Purchase successful',
      order: orderResult.rows[0],
      newBalance: currentBalance - totalAmount
    });

  } catch (error) {
    console.error('Wallet purchase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { purchaseWithWallet };