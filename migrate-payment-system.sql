-- Migration script for manual payment system
-- Run this on your production database

BEGIN;

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS joining_fee_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS joining_fee_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_proof_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS payment_confirmed_by INTEGER,
ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMP;

-- Add foreign key constraint if admin_users table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
        ALTER TABLE users ADD CONSTRAINT fk_payment_confirmed_by 
        FOREIGN KEY (payment_confirmed_by) REFERENCES admin_users(id);
    END IF;
END $$;

-- Create payment_confirmations table
CREATE TABLE IF NOT EXISTS payment_confirmations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    proof_url VARCHAR(500),
    confirmed_by INTEGER,
    confirmed_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for payment_confirmations if admin_users exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
        ALTER TABLE payment_confirmations ADD CONSTRAINT fk_confirmed_by 
        FOREIGN KEY (confirmed_by) REFERENCES admin_users(id);
    END IF;
END $$;

-- Update settings table with joining fee
INSERT INTO settings (key, value) VALUES ('joining_fee', '18000') 
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_joining_fee_paid ON users(joining_fee_paid);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_status ON payment_confirmations(status);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_user_id ON payment_confirmations(user_id);

COMMIT;