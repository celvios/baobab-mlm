const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.post('/cleanup-deposits', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const result = await client.query(`
      DELETE FROM deposit_requests 
      WHERE id NOT IN (
        SELECT MIN(id) 
        FROM deposit_requests 
        GROUP BY user_id
      )
    `);
    
    await client.query(`
      ALTER TABLE deposit_requests 
      ADD CONSTRAINT IF NOT EXISTS unique_user_deposit 
      UNIQUE (user_id)
    `);
    
    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      message: `Deleted ${result.rowCount} duplicate deposits` 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;
