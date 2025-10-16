-- Migration: Add Stage-Qualified Matrix Tracking
-- This enables tracking of qualified members (same stage) vs total members

-- Add column to track qualified slots (same-stage members)
ALTER TABLE stage_matrix 
ADD COLUMN IF NOT EXISTS qualified_slots_filled INTEGER DEFAULT 0;

-- Create table to track which users are in which matrices
CREATE TABLE IF NOT EXISTS stage_matrix_members (
    id SERIAL PRIMARY KEY,
    matrix_owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    matrix_stage VARCHAR(50) NOT NULL,
    member_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    member_stage_at_placement VARCHAR(50) NOT NULL,
    is_qualified BOOLEAN DEFAULT FALSE,
    qualified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(matrix_owner_id, matrix_stage, member_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stage_matrix_members_owner ON stage_matrix_members(matrix_owner_id, matrix_stage);
CREATE INDEX IF NOT EXISTS idx_stage_matrix_members_member ON stage_matrix_members(member_id);
CREATE INDEX IF NOT EXISTS idx_stage_matrix_members_qualified ON stage_matrix_members(is_qualified);

-- Update existing stage_matrix records to set qualified_slots_filled = slots_filled for no_stage only
-- (no_stage doesn't require stage qualification, just paid members)
UPDATE stage_matrix 
SET qualified_slots_filled = slots_filled 
WHERE stage = 'no_stage';

-- For all other stages, set qualified_slots_filled to 0 (will be recalculated)
UPDATE stage_matrix 
SET qualified_slots_filled = 0 
WHERE stage != 'no_stage';
