-- Fix stage_matrix for all users
INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
SELECT 
  u.id,
  u.mlm_level,
  COALESCE((
    SELECT COUNT(*) 
    FROM referral_earnings re
    WHERE re.user_id = u.id AND re.stage = u.mlm_level AND re.status = 'completed'
  ), 0) as slots_filled,
  CASE 
    WHEN u.mlm_level = 'feeder' THEN 6
    WHEN u.mlm_level IN ('bronze', 'silver', 'gold', 'diamond') THEN 14
    ELSE 0
  END as slots_required
FROM users u
WHERE u.mlm_level IS NOT NULL AND u.mlm_level != 'no_stage'
ON CONFLICT (user_id, stage) 
DO UPDATE SET 
  slots_filled = EXCLUDED.slots_filled,
  is_complete = (EXCLUDED.slots_filled >= EXCLUDED.slots_required);
