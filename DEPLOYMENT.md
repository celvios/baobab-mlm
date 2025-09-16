# Baobab MLM Platform - Deployment Guide

## Updated Features
- Manual payment system with admin confirmation
- Wallet-based product purchases
- Payment proof upload functionality
- Separate wallet balance and MLM earnings

## Backend Deployment (Render)

### 1. Database Migration
First, update your PostgreSQL database with the new schema:

```sql
-- Add new columns to users table
ALTER TABLE users ADD COLUMN joining_fee_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN joining_fee_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN payment_proof_url VARCHAR(500);
ALTER TABLE users ADD COLUMN payment_confirmed_by INTEGER REFERENCES admin_users(id);
ALTER TABLE users ADD COLUMN payment_confirmed_at TIMESTAMP;

-- Create new tables
CREATE TABLE payment_confirmations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    proof_url VARCHAR(500),
    confirmed_by INTEGER REFERENCES admin_users(id),
    confirmed_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update settings
INSERT INTO settings (key, value) VALUES ('joining_fee', '18000') 
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

### 2. Environment Variables (Render)
Add these to your Render dashboard:

```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://baobab-mlm.vercel.app
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### 3. File Upload Configuration
Render will handle file uploads in the `/tmp` directory. The payment proof uploads will work automatically.

## Frontend Deployment (Vercel)

### Environment Variables (Vercel)
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
REACT_APP_FRONTEND_URL=https://your-frontend-url.vercel.app
```

## Deployment Steps

### Backend (Render)
1. Push backend code to GitHub
2. Connect Render to your repository
3. Set environment variables
4. Deploy service
5. Run database migration via Render shell or database client

### Frontend (Vercel)
1. Push frontend code to GitHub  
2. Connect Vercel to your repository
3. Set environment variables
4. Deploy

## Post-Deployment Checklist

1. **Test user registration** - Verify new users start with ₦0 balance
2. **Test payment upload** - Users can upload payment proof
3. **Test admin confirmation** - Admin can confirm payments and credit wallets
4. **Test product purchases** - Products can only be bought with sufficient wallet balance
5. **Test MLM earnings** - Separate display of wallet balance vs MLM earnings

## New Admin Features
- Access `/admin/pending-payments` to manage payment confirmations
- View uploaded payment proofs
- Confirm payments and credit user wallets
- Track payment confirmation history

## URLs
- Frontend: https://baobab-mlm.vercel.app
- Backend: https://baobab-backend.onrender.com
- Admin Panel: https://baobab-mlm.vercel.app/admin
- Pending Payments: https://baobab-mlm.vercel.app/admin/pending-payments