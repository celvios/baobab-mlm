-- Migration: Add Deposit System
-- Description: Adds deposit tracking and dashboard unlock functionality

-- Add deposit-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deposit_confirmed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS dashboard_unlocked BOOLEAN DEFAULT FALSE;

-- Update default mlm_level to no_stage
ALTER TABLE users ALTER COLUMN mlm_level SET DEFAULT 'no_stage';

-- Create deposit_requests table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user ON deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON deposit_requests(status);
CREATE INDEX IF NOT EXISTS idx_users_dashboard_unlocked ON users(dashboard_unlocked);
CREATE INDEX IF NOT EXISTS idx_users_deposit_confirmed ON users(deposit_confirmed);
