-- Create new admin for info@baobabworldwide.com
-- Password: Baobab2025!

-- First, check if admin exists
SELECT id, email, name FROM admins WHERE email = 'info@baobabworldwide.com';

-- If not exists, insert new admin
-- Password hash for 'Baobab2025!' using bcrypt
INSERT INTO admins (email, password, name, role, is_active)
VALUES (
  'info@baobabworldwide.com',
  '$2a$10$YourHashWillBeHere',
  'Baobab Admin',
  'super_admin',
  true
)
ON CONFLICT (email) DO UPDATE 
SET password = EXCLUDED.password,
    updated_at = CURRENT_TIMESTAMP;

-- Verify admin was created
SELECT id, email, name, role, is_active, created_at FROM admins WHERE email = 'info@baobabworldwide.com';
