-- Fix existing users without mlm_level
UPDATE users 
SET mlm_level = 'feeder' 
WHERE mlm_level IS NULL OR mlm_level = '' OR mlm_level = 'no_stage';

-- Create stage_matrix entries for users who don't have one
INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
SELECT id, 'feeder', 0, 6
FROM users
WHERE id NOT IN (SELECT user_id FROM stage_matrix WHERE stage = 'feeder')
ON CONFLICT (user_id, stage) DO NOTHING;
