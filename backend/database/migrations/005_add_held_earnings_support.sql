-- Migration to support held earnings for No Stage users
-- Add held status to referral_earnings if not exists

-- Update referral_earnings status column to support 'held' status
ALTER TABLE referral_earnings 
ALTER COLUMN status TYPE VARCHAR(50);

-- Add index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_referral_earnings_status ON referral_earnings(status);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_user_status ON referral_earnings(user_id, status);

-- Update existing 'completed' earnings for no_stage users to 'held'
UPDATE referral_earnings 
SET status = 'held' 
WHERE user_id IN (
  SELECT id FROM users WHERE mlm_level = 'no_stage' OR mlm_level IS NULL
) AND status = 'completed';

-- Add comment for documentation
COMMENT ON COLUMN referral_earnings.status IS 'Status of earning: completed, held, pending';