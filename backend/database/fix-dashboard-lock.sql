-- Add missing columns to users table for dashboard lock functionality
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS dashboard_unlocked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deposit_confirmed BOOLEAN DEFAULT FALSE;

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
