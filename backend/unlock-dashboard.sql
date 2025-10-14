-- Manually unlock dashboard for a user
-- Replace 'your-email@example.com' with your actual email

UPDATE users 
SET dashboard_unlocked = TRUE,
    deposit_confirmed = TRUE,
    deposit_confirmed_at = NOW()
WHERE email = 'your-email@example.com';

-- Check the result
SELECT id, email, dashboard_unlocked, deposit_confirmed, mlm_level 
FROM users 
WHERE email = 'your-email@example.com';
