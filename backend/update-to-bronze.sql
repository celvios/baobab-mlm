-- Auto-upgrade all users through all stages when they complete their matrix

-- Feeder to Bronze (6+ slots)
UPDATE users SET mlm_level = 'bronze' 
WHERE mlm_level = 'feeder' AND id IN (
  SELECT user_id FROM stage_matrix WHERE stage = 'feeder' AND slots_filled >= 6
);

-- Bronze to Silver (14+ slots)
UPDATE users SET mlm_level = 'silver' 
WHERE mlm_level = 'bronze' AND id IN (
  SELECT user_id FROM stage_matrix WHERE stage = 'bronze' AND slots_filled >= 14
);

-- Silver to Gold (14+ slots)
UPDATE users SET mlm_level = 'gold' 
WHERE mlm_level = 'silver' AND id IN (
  SELECT user_id FROM stage_matrix WHERE stage = 'silver' AND slots_filled >= 14
);

-- Gold to Diamond (14+ slots)
UPDATE users SET mlm_level = 'diamond' 
WHERE mlm_level = 'gold' AND id IN (
  SELECT user_id FROM stage_matrix WHERE stage = 'gold' AND slots_filled >= 14
);

-- Diamond to Infinity (14+ slots)
UPDATE users SET mlm_level = 'infinity' 
WHERE mlm_level = 'diamond' AND id IN (
  SELECT user_id FROM stage_matrix WHERE stage = 'diamond' AND slots_filled >= 14
);

-- Create next stage matrix entries
INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required, is_complete)
SELECT id, 'bronze', 0, 14, false FROM users WHERE mlm_level = 'bronze'
ON CONFLICT (user_id, stage) DO NOTHING;

INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required, is_complete)
SELECT id, 'silver', 0, 14, false FROM users WHERE mlm_level = 'silver'
ON CONFLICT (user_id, stage) DO NOTHING;

INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required, is_complete)
SELECT id, 'gold', 0, 14, false FROM users WHERE mlm_level = 'gold'
ON CONFLICT (user_id, stage) DO NOTHING;

INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required, is_complete)
SELECT id, 'diamond', 0, 14, false FROM users WHERE mlm_level = 'diamond'
ON CONFLICT (user_id, stage) DO NOTHING;

INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required, is_complete)
SELECT id, 'infinity', 0, 0, false FROM users WHERE mlm_level = 'infinity'
ON CONFLICT (user_id, stage) DO NOTHING;

-- Verify
SELECT u.id, u.email, u.full_name, u.mlm_level, sm.slots_filled, sm.slots_required
FROM users u
LEFT JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = u.mlm_level
ORDER BY u.created_at;
