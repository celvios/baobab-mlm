-- Test data for Baobab MLM system

-- Insert test users
INSERT INTO users (name, email, password, phone, role, status) VALUES
('Admin User', 'admin@baobab.com', '$2b$10$hashedpassword', '+2348012345678', 'admin', 'active'),
('John Doe', 'john@test.com', '$2b$10$hashedpassword', '+2348012345679', 'user', 'active'),
('Jane Smith', 'jane@test.com', '$2b$10$hashedpassword', '+2348012345680', 'user', 'pending');

-- Insert test products
INSERT INTO products (name, description, price, stock_quantity, category, status) VALUES
('Baobab Oil 100ml', 'Premium organic baobab oil', 15000, 100, 'skincare', 'active'),
('Baobab Powder 250g', 'Natural baobab fruit powder', 8000, 50, 'supplements', 'active'),
('Baobab Capsules', 'Baobab extract capsules', 12000, 75, 'supplements', 'active');

-- Insert test orders
INSERT INTO orders (user_id, product_id, quantity, total_amount, order_status, order_number) VALUES
(2, 1, 2, 30000, 'completed', 'ORD-001'),
(3, 2, 1, 8000, 'pending', 'ORD-002'),
(2, 3, 3, 36000, 'completed', 'ORD-003');

-- Insert test transactions
INSERT INTO transactions (user_id, type, amount, status, description) VALUES
(2, 'commission', 5000, 'completed', 'Referral commission'),
(3, 'purchase', -8000, 'completed', 'Product purchase'),
(2, 'bonus', 2000, 'completed', 'Monthly bonus');

-- Insert test MLM stages
INSERT INTO mlm_stages (name, description, requirements, commission_rate, bonus_amount) VALUES
('Bronze', 'Entry level', 'Register and make first purchase', 5.0, 1000),
('Silver', 'Intermediate level', 'Refer 5 users', 7.5, 2500),
('Gold', 'Advanced level', 'Refer 15 users', 10.0, 5000);