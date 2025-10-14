# Dashboard Lock Issue - Root Cause & Fix

## Problem
New users are seeing "Feeder" stage instead of "No Stage" and the dashboard is not locked when they register.

## Root Causes

### 1. Missing Database Columns
The `users` table is missing two critical columns:
- `dashboard_unlocked` - Controls whether user can access dashboard features
- `deposit_confirmed` - Tracks if admin has confirmed the deposit

### 2. Wrong Default Value
In `schema.sql`, the `mlm_level` column has:
```sql
mlm_level VARCHAR(50) DEFAULT 'feeder'
```
Should be:
```sql
mlm_level VARCHAR(50) DEFAULT 'no_stage'
```

### 3. Auto-Upgrade Logic in userController.js
Lines 88-93 were forcing all users to "feeder" stage:
```javascript
if (!user.mlm_level || user.mlm_level === 'no_stage' || user.mlm_level === '') {
  await pool.query('UPDATE users SET mlm_level = $1 WHERE id = $2', ['feeder', userId]);
  user.mlm_level = 'feeder';
}
```

## Solution

### Step 1: Run Database Migration
```bash
cd backend
psql -U your_username -d baobab_mlm -f database/fix-dashboard-lock.sql
```

This will:
- Add `dashboard_unlocked` and `deposit_confirmed` columns
- Change default `mlm_level` to 'no_stage'
- Update existing users without deposits to 'no_stage'
- Unlock dashboard for users who have already paid

### Step 2: Code Changes (Already Applied)

#### authController.js
- Added error handling for `dashboard_unlocked` column
- Ensures new users start with `mlm_level = 'no_stage'` and `dashboard_unlocked = false`

#### userController.js
- Removed auto-upgrade logic that forced users to 'feeder'
- Now only sets 'no_stage' if mlm_level is null or empty

#### depositController.js
- Added fallback logic for missing columns
- Uses `joining_fee_paid` as fallback if new columns don't exist
- Properly returns dashboard lock status

### Step 3: Update Schema for Future Deployments

Update `backend/database/schema.sql`:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    referral_code VARCHAR(50) UNIQUE,
    referred_by INTEGER REFERENCES users(id),
    mlm_level VARCHAR(50) DEFAULT 'no_stage',  -- Changed from 'feeder'
    dashboard_unlocked BOOLEAN DEFAULT FALSE,   -- Added
    deposit_confirmed BOOLEAN DEFAULT FALSE,    -- Added
    deposit_amount DECIMAL(10,2) DEFAULT 0,     -- Added
    deposit_confirmed_at TIMESTAMP,             -- Added
    joining_fee_paid BOOLEAN DEFAULT FALSE,
    joining_fee_amount DECIMAL(10,2) DEFAULT 0,
    payment_proof_url VARCHAR(500),
    payment_confirmed_by INTEGER REFERENCES admin_users(id),
    payment_confirmed_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Expected Behavior After Fix

### New User Registration:
1. User registers → `mlm_level = 'no_stage'`, `dashboard_unlocked = false`
2. User sees DashboardLock component with "No Stage" status
3. User clicks "Make Deposit" and uploads payment proof
4. Dashboard remains locked with "Pending" status

### After Admin Approval:
1. Admin approves deposit in admin panel
2. User's `dashboard_unlocked = true`, `deposit_confirmed = true`
3. User's `mlm_level` changes from 'no_stage' to 'feeder'
4. Dashboard unlocks and user can access all features

### Existing Users:
- Users who already paid: Dashboard unlocked, stage preserved
- Users who haven't paid: Dashboard locked, stage set to 'no_stage'

## Testing

1. Register a new user
2. Verify dashboard shows lock screen with "No Stage"
3. Submit deposit request
4. Verify dashboard still locked
5. Admin approves deposit
6. Verify dashboard unlocks and shows "Feeder" stage

## Files Modified
- ✅ `backend/database/fix-dashboard-lock.sql` (created)
- ✅ `backend/src/controllers/authController.js`
- ✅ `backend/src/controllers/userController.js`
- ✅ `backend/src/controllers/depositController.js`
- ⚠️ `backend/database/schema.sql` (needs manual update)
