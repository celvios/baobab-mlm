-- Fix users who were incorrectly auto-upgraded to feeder
-- This script resets users back to no_stage if they haven't completed their matrix

-- Step 1: Update stage_matrix for no_stage users to have 4 slots instead of 6
UPDATE stage_matrix 
SET slots_required = 4
WHERE stage = 'no_stage' AND slots_required = 6;

-- Step 2: Update stage_matrix for feeder users to ensure they have 6 slots
UPDATE stage_matrix 
SET slots_required = 6
WHERE stage = 'feeder' AND slots_required != 6;

-- Step 3: Reset users who are at feeder but haven't completed their no_stage matrix
-- Only reset if they have less than 4 paid referrals
UPDATE users u
SET mlm_level = 'no_stage'
WHERE u.mlm_level = 'feeder'
AND (
  SELECT COUNT(*) 
  FROM users ref
  WHERE ref.referred_by = u.referral_code
  AND EXISTS (
    SELECT 1 FROM deposit_requests dr 
    WHERE dr.user_id = ref.id AND dr.status = 'approved'
  )
) < 4;

-- Step 4: Create stage_matrix entries for users who don't have them
INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
SELECT u.id, u.mlm_level, 0, 
  CASE 
    WHEN u.mlm_level = 'no_stage' THEN 4
    WHEN u.mlm_level = 'feeder' THEN 6
    ELSE 14
  END
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM stage_matrix sm 
  WHERE sm.user_id = u.id AND sm.stage = u.mlm_level
)
AND u.mlm_level IS NOT NULL;

-- Step 5: Update slots_filled to match actual paid referrals
UPDATE stage_matrix sm
SET slots_filled = (
  SELECT COUNT(*) 
  FROM users ref
  WHERE ref.referred_by = (SELECT referral_code FROM users WHERE id = sm.user_id)
  AND EXISTS (
    SELECT 1 FROM deposit_requests dr 
    WHERE dr.user_id = ref.id AND dr.status = 'approved'
  )
),
is_complete = (
  SELECT COUNT(*) 
  FROM users ref
  WHERE ref.referred_by = (SELECT referral_code FROM users WHERE id = sm.user_id)
  AND EXISTS (
    SELECT 1 FROM deposit_requests dr 
    WHERE dr.user_id = ref.id AND dr.status = 'approved'
  )
) >= sm.slots_required;

-- Display summary of changes
SELECT 
  u.mlm_level,
  COUNT(*) as user_count,
  AVG(sm.slots_filled) as avg_slots_filled,
  AVG(sm.slots_required) as avg_slots_required
FROM users u
LEFT JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = u.mlm_level
GROUP BY u.mlm_level
ORDER BY 
  CASE u.mlm_level
    WHEN 'no_stage' THEN 1
    WHEN 'feeder' THEN 2
    WHEN 'bronze' THEN 3
    WHEN 'silver' THEN 4
    WHEN 'gold' THEN 5
    WHEN 'diamond' THEN 6
    WHEN 'infinity' THEN 7
  END;
