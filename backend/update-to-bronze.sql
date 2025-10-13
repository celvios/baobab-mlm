-- Auto-upgrade all users from feeder to bronze when they complete their matrix

-- Update users who completed feeder stage (6+ slots filled)
UPDATE users 
SET mlm_level = 'bronze' 
WHERE mlm_level = 'feeder' 
AND id IN (
  SELECT user_id 
  FROM stage_matrix 
  WHERE stage = 'feeder' 
  AND slots_filled >= 6
);

-- Create bronze stage_matrix entries for upgraded users
INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required, is_complete)
SELECT id, 'bronze', 0, 14, false
FROM users 
WHERE mlm_level = 'bronze'
ON CONFLICT (user_id, stage) DO NOTHING;

-- Verify the updates
SELECT u.id, u.email, u.full_name, u.mlm_level, sm.slots_filled, sm.slots_required
FROM users u
LEFT JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = u.mlm_level
ORDER BY u.created_at;
