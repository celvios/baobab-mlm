const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.post('/run-phase1', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Migration 1: Add columns to users table
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS deposit_confirmed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deposit_confirmed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS dashboard_unlocked BOOLEAN DEFAULT FALSE
    `);
    
    await client.query(`ALTER TABLE users ALTER COLUMN mlm_level SET DEFAULT 'no_stage'`);
    
    // Add columns to existing deposit_requests table
    await client.query(`
      ALTER TABLE deposit_requests 
      ADD COLUMN IF NOT EXISTS admin_notes TEXT,
      ADD COLUMN IF NOT EXISTS confirmed_by INTEGER REFERENCES admin_users(id),
      ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP
    `);
    
    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_deposit_requests_user ON deposit_requests(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON deposit_requests(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_dashboard_unlocked ON users(dashboard_unlocked)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_deposit_confirmed ON users(deposit_confirmed)`);
    
    // Migration 2: Matrix Positions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS matrix_positions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        stage VARCHAR(50) NOT NULL,
        position_path VARCHAR(255) NOT NULL,
        parent_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        level_in_matrix INTEGER DEFAULT 1,
        is_filled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, stage)
      )
    `);
    
    // Add columns to stage_matrix
    await client.query(`
      ALTER TABLE stage_matrix 
      ADD COLUMN IF NOT EXISTS completed_accounts_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS required_completed_accounts INTEGER DEFAULT 0
    `);
    
    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_matrix_positions_user ON matrix_positions(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_matrix_positions_parent ON matrix_positions(parent_user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_matrix_positions_stage ON matrix_positions(stage)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_stage_matrix_complete ON stage_matrix(user_id, is_complete)`);
    
    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      message: 'Phase 1 migrations completed successfully' 
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  } finally {
    client.release();
  }
});

module.exports = router;
