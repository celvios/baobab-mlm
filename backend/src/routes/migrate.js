const express = require('express');
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.post('/run-mlm-migration', async (req, res) => {
  try {
    console.log('Running MLM migration...');
    
    const sqlPath = path.join(__dirname, '../../database/mlm-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ MLM tables created successfully!');
    res.json({ 
      success: true, 
      message: 'MLM migration completed successfully' 
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Migration failed', 
      error: error.message 
    });
  }
});

module.exports = router;
