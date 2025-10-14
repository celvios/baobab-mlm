const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

router.post('/run-phase1', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Migration 1: Deposit System
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS deposit_confirmed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deposit_confirmed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS dashboard_unlocked BOOLEAN DEFAULT FALSE;
      
      ALTER TABLE users ALTER COLUMN mlm_level SET DEFAULT 'no_stage';
      
      CREATE TABLE IF NOT EXISTS deposit_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL CHECK (amount >= 18000),
        proof_url VARCHAR(500) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        admin_notes TEXT,
        confirmed_by INTEGER REFERENCES admin_users(id),
        confirmed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_deposit_requests_user ON deposit_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON deposit_requests(status);
      CREATE INDEX IF NOT EXISTS idx_users_dashboard_unlocked ON users(dashboard_unlocked);
      CREATE INDEX IF NOT EXISTS idx_users_deposit_confirmed ON users(deposit_confirmed);
    `);
    
    // Migration 2: Matrix Positions
    await client.query(`
      CREATE TABLE IF NOT EXISTS matrix_positions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        stage VARCHAR(50) NOT NULL CHECK (stage IN ('feeder', 'bronze', 'silver', 'gold', 'diamond', 'infinity')),
        position_path VARCHAR(255) NOT NULL,
        parent_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        level_in_matrix INTEGER DEFAULT 1 CHECK (level_in_matrix >= 1),
        is_filled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, stage)
      );
      
      ALTER TABLE stage_matrix 
      ADD COLUMN IF NOT EXISTS completed_accounts_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS required_completed_accounts INTEGER DEFAULT 0;
      
      CREATE INDEX IF NOT EXISTS idx_matrix_positions_user ON matrix_positions(user_id);
      CREATE INDEX IF NOT EXISTS idx_matrix_positions_parent ON matrix_positions(parent_user_id);
      CREATE INDEX IF NOT EXISTS idx_matrix_positions_stage ON matrix_positions(stage);
      CREATE INDEX IF NOT EXISTS idx_stage_matrix_complete ON stage_matrix(user_id, is_complete);
    `);
    
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
