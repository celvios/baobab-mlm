-- Add dashboard lock columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deposit_confirmed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS dashboard_unlocked BOOLEAN DEFAULT FALSE;

-- Set default mlm_level to no_stage
ALTER TABLE users ALTER COLUMN mlm_level SET DEFAULT 'no_stage';

-- Update all existing users to have locked dashboard
UPDATE users 
SET dashboard_unlocked = FALSE, 
    deposit_confirmed = FALSE, 
    mlm_level = 'no_stage'
WHERE dashboard_unlocked IS NULL OR deposit_confirmed IS NULL;

-- Show results
SELECT id, email, mlm_level, dashboard_unlocked, deposit_confirmed 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
