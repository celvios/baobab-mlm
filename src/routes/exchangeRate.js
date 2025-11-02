const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Public endpoint to get current exchange rate
router.get('/', async (req, res) => {
  try {
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
      'SELECT currency_code, rate, updated_at FROM exchange_rates WHERE currency_code = $1',
      ['NGN']
    );
    
    if (result.rows.length === 0) {
      await pool.query(
        'INSERT INTO exchange_rates (currency_code, rate) VALUES ($1, $2)',
        ['NGN', 1500]
      );
      return res.json({ rate: 1500, currency_code: 'NGN' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get exchange rate error:', error);
    res.json({ rate: 1500, currency_code: 'NGN' });
  }
});

module.exports = router;
