# Baobab MLM Backend Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Gmail account for email service

## Database Setup

1. **Install PostgreSQL** and create a database:
   ```sql
   CREATE DATABASE baobab_mlm;
   ```

2. **Create a user** (optional but recommended):
   ```sql
   CREATE USER baobab_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE baobab_mlm TO baobab_user;
   ```

## Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   - Copy `.env.example` to `.env`
   - Update the following variables:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=baobab_mlm
   DB_USER=baobab_user
   DB_PASSWORD=your_password
   
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_app_password
   
   FRONTEND_URL=http://localhost:3000
   ```

4. **Gmail App Password Setup**:
   - Go to Google Account settings
   - Enable 2-Factor Authentication
   - Generate an App Password for "Mail"
   - Use this App Password in EMAIL_PASS

5. **Run Database Migrations**:
   ```bash
   npm run migrate
   ```

6. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Frontend Setup

1. **Navigate to root directory**:
   ```bash
   cd ..
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start React development server**:
   ```bash
   npm start
   ```

## Testing the Integration

1. **Backend Health Check**: Visit `http://localhost:5000/api/health`
2. **Frontend**: Visit `http://localhost:3000`
3. **Register a new user** - you should receive a verification email
4. **Verify email** by clicking the link
5. **Login** with verified credentials

## Phase 1 Features Working

✅ User Registration with Email Verification
✅ User Login with JWT Authentication  
✅ Email Verification System
✅ User Profile Management
✅ Wallet System (view-only)
✅ Withdrawal Request System
✅ Market Updates/Notifications
✅ Frontend-Backend Integration

## Next Steps

Ready for **Phase 2**: MLM Matrix & Earnings System
- Referral tracking
- Matrix calculations
- Earnings computation
- Level progression