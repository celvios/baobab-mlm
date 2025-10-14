-- Run this on Render PostgreSQL after deployment
-- Copy from fix-dashboard-lock.sql for easy execution

-- Add missing columns to users table for dashboard lock functionality
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS dashboard_unlocked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deposit_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_confirmed_at TIMESTAMP;

-- Change default mlm_level from 'feeder' to 'no_stage' for new users
ALTER TABLE users 
ALTER COLUMN mlm_level SET DEFAULT 'no_stage';

-- Update existing users who haven't deposited to 'no_stage'
UPDATE users 
SET mlm_level = 'no_stage', 
    dashboard_unlocked = FALSE
WHERE joining_fee_paid = FALSE 
  AND mlm_level = 'feeder';

-- Users who have paid should have dashboard unlocked
UPDATE users 
SET dashboard_unlocked = TRUE,
    deposit_confirmed = TRUE
WHERE joining_fee_paid = TRUE;

-- Verify changes
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN mlm_level = 'no_stage' THEN 1 END) as no_stage_users,
    COUNT(CASE WHEN mlm_level = 'feeder' THEN 1 END) as feeder_users,
    COUNT(CASE WHEN dashboard_unlocked = TRUE THEN 1 END) as unlocked_users
FROM users;
