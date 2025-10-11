-- Update all users with 'no_stage' to 'feeder'
UPDATE users 
SET mlm_level = 'feeder' 
WHERE mlm_level = 'no_stage' OR mlm_level IS NULL;

-- Ensure all users have stage_matrix entry
INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
SELECT id, 'feeder', 0, 6
FROM users
WHERE id NOT IN (SELECT user_id FROM stage_matrix WHERE stage = 'feeder')
ON CONFLICT (user_id, stage) DO NOTHING;
