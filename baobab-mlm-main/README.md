# Baobab MLM Backend API - Phase 1

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Database Setup**
   - Install PostgreSQL
   - Create a database named `baobab_mlm`
   - Copy `.env.example` to `.env` and update with your database credentials

3. **Run Migrations**
   ```bash
   npm run migrate
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/wallet` - Get wallet information
- `GET /api/user/transactions` - Get transaction history

### Withdrawals
- `POST /api/withdrawal/request` - Request withdrawal
- `GET /api/withdrawal/requests` - Get withdrawal requests

### Market Updates
- `GET /api/market-updates` - Get market updates
- `PUT /api/market-updates/:id/read` - Mark update as read
- `GET /api/market-updates/unread-count` - Get unread count

## Phase 1 Features Completed

✅ User registration and authentication
✅ JWT-based authorization
✅ User profile management
✅ Wallet system (view-only)
✅ Transaction history
✅ Withdrawal request system
✅ Market updates/notifications system
✅ Database schema with proper relationships

## Next Phases

**Phase 2**: MLM Matrix & Earnings System
**Phase 3**: Product Management Integration
**Phase 4**: Admin Dashboard Backend
**Phase 5**: Email System Integration