# Backend Deployment Steps

## 1. Prepare for Render
```bash
# In backend directory
npm install
npm start  # Test locally first
```

## 2. Database Schema for Repurchase System
Add these tables to your PostgreSQL:

```sql
-- Add repurchase tracking
ALTER TABLE users ADD COLUMN registration_fee DECIMAL(10,2) DEFAULT 9000;
ALTER TABLE users ADD COLUMN initial_product_purchase DECIMAL(10,2) DEFAULT 9000;

-- Repurchase requirements table
CREATE TABLE repurchase_requirements (
  id SERIAL PRIMARY KEY,
  stage VARCHAR(20) NOT NULL,
  required_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default repurchase amounts
INSERT INTO repurchase_requirements (stage, required_amount) VALUES
('feeder', 4500),
('bronze', 6000),
('silver', 12000),
('gold', 18000),
('diamond', 24000);

-- Repurchase orders table
CREATE TABLE repurchase_orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  stage VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  products JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 3. Render Deployment
1. Connect GitHub repo to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables
5. Deploy