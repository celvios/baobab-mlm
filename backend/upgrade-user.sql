-- Upgrade specific user to Bronze
UPDATE users SET mlm_level = 'bronze' WHERE email = 'celvios002@gmail.com';

-- Create bronze stage matrix
INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required, is_complete)
SELECT id, 'bronze', 0, 14, false
FROM users WHERE email = 'celvios002@gmail.com'
ON CONFLICT (user_id, stage) DO UPDATE SET stage = 'bronze';

-- Verify
SELECT id, email, full_name, mlm_level FROM users WHERE email = 'celvios002@gmail.com';
