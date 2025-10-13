-- Update user to Bronze level
-- Replace 'your-email@example.com' with your actual email

UPDATE users 
SET mlm_level = 'bronze' 
WHERE email = 'your-email@example.com';

-- Update stage_matrix for bronze
INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required, is_complete)
SELECT id, 'bronze', 0, 14, false
FROM users 
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id, stage) 
DO UPDATE SET stage = 'bronze', slots_required = 14;

-- Verify the update
SELECT id, email, full_name, mlm_level FROM users WHERE email = 'your-email@example.com';
