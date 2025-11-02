const pool = require('../config/database');

const getExchangeRate = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT currency_code, rate, updated_at FROM exchange_rates WHERE currency_code = $1',
      ['NGN']
    );
    
    if (result.rows.length === 0) {
      return res.json({ rate: 1500, currency_code: 'NGN' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get exchange rate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateExchangeRate = async (req, res) => {
  try {
    const { rate } = req.body;
    
    if (!rate || rate <= 0) {
      return res.status(400).json({ message: 'Invalid exchange rate' });
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS exchange_rates (
        id SERIAL PRIMARY KEY,
        currency_code VARCHAR(3) NOT NULL UNIQUE,
        rate DECIMAL(10, 4) NOT NULL,
        updated_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query(
      `INSERT INTO exchange_rates (currency_code, rate, updated_by, updated_at) 
       VALUES ('NGN', $1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (currency_code) 
       DO UPDATE SET rate = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [rate, req.admin?.id]
    );

    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin?.id, 'update_exchange_rate', `Updated NGN exchange rate to ${rate}`]
    );

    res.json({ 
      message: 'Exchange rate updated successfully',
      rate: result.rows[0]
    });
  } catch (error) {
    console.error('Update exchange rate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getExchangeRate, updateExchangeRate };
