-- Add referral_level column to referral_earnings table
ALTER TABLE referral_earnings 
ADD COLUMN IF NOT EXISTS referral_level INTEGER DEFAULT 1;

-- Update existing records to have level 1 (direct referrals)
UPDATE referral_earnings 
SET referral_level = 1 
WHERE referral_level IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_referral_earnings_level 
ON referral_earnings(user_id, referral_level);

-- Add comment for clarity
COMMENT ON COLUMN referral_earnings.referral_level IS 'Referral level: 1 = direct, 2 = indirect';