-- Migration: Add Matrix Position Tracking
-- Description: Adds tables for pyramid matrix and spillover tracking

-- Create matrix_positions table for spillover tracking
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

-- Update stage_matrix table
ALTER TABLE stage_matrix 
ADD COLUMN IF NOT EXISTS completed_accounts_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS required_completed_accounts INTEGER DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_matrix_positions_user ON matrix_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_matrix_positions_parent ON matrix_positions(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_matrix_positions_stage ON matrix_positions(stage);
CREATE INDEX IF NOT EXISTS idx_stage_matrix_complete ON stage_matrix(user_id, is_complete);
