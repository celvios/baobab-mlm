# Balance and Email Display Issues - Diagnosis & Fixes

## Issues Identified

### 1. **Email shows "user@example.com" instead of actual email**
**Location:** Sidebar account dropdown (DashboardLayout.js)

**Root Cause:**
- The `fetchUserProfile()` function in DashboardLayout.js calls `apiService.getProfile()`
- If the API call fails or returns incomplete data, it falls back to showing "user@example.com"
- The backend `/api/user/profile` endpoint requires authentication via JWT token

**Why it happens:**
- JWT token might be expired or invalid
- Backend authentication middleware (`auth.js`) might be failing
- User data not properly stored in localStorage after login
- API endpoint returning error but frontend not handling it properly

### 2. **Balance shows 0 or doesn't display**
**Location:** Dashboard wallet overview

**Root Cause:**
- The balance comes from `userProfile.wallet.balance` which is fetched from backend
- Backend `getProfile()` in userController.js queries the `wallets` table
- If wallet record doesn't exist for the user, it returns `{ balance: 0 }`
- The wallet might not have been created during registration

**Why it happens:**
- Wallet record not created when user registered
- Database query failing silently (try-catch returns default 0)
- Wallet table might not exist or have wrong schema

### 3. **Market Updates shows welcome message with name but other data missing**
**Location:** Dashboard market updates section

**Root Cause:**
- Market updates are fetched from backend `/api/market-updates` endpoint
- Welcome message is created during login in authController.js
- The message uses `user.full_name` which comes from the users table
- But other profile data (email, balance) comes from different queries

**Why it works for name but not email/balance:**
- The `full_name` is stored directly in the `users` table and always available
- Email and balance require additional queries that might be failing

## Fixes Required

### Fix 1: Ensure Wallet is Created During Registration

**File:** `backend/src/controllers/authController.js`

The registration already has this code:
```javascript
// Create wallet
await pool.query('INSERT INTO wallets (user_id) VALUES ($1)', [user.id]);
```

**Verify:**
1. Check if wallets table exists in database
2. Check if wallet record was created for your user
3. Run this SQL to check:
```sql
SELECT u.id, u.email, u.full_name, w.balance 
FROM users u 
LEFT JOIN wallets w ON u.id = w.user_id 
WHERE u.email = 'your-email@example.com';
```

If wallet is NULL, create it manually:
```sql
INSERT INTO wallets (user_id, balance, total_earned, total_withdrawn) 
VALUES ((SELECT id FROM users WHERE email = 'your-email@example.com'), 0, 0, 0);
```

### Fix 2: Check JWT Token and Authentication

**Issue:** Token might be expired or not being sent with requests

**Check:**
1. Open browser DevTools → Application → Local Storage
2. Look for `token` key - should have a JWT string
3. Check if token is being sent in API requests (Network tab → Headers → Authorization)

**Fix if token is missing:**
- Log out and log in again
- Check if login response includes token
- Verify token is saved to localStorage in `useAuth.js`

### Fix 3: Add Better Error Handling in Frontend

**File:** `src/layouts/DashboardLayout.js`

Current code:
```javascript
const fetchUserProfile = async () => {
  try {
    const profile = await apiService.getProfile();
    setUserProfile(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
};
```

**Improved version:**
```javascript
const fetchUserProfile = async () => {
  try {
    const profile = await apiService.getProfile();
    console.log('Profile fetched:', profile); // Debug log
    setUserProfile(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Try to use stored user data as fallback
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser.email) {
      setUserProfile({
        fullName: storedUser.fullName,
        email: storedUser.email,
        referralCode: storedUser.referralCode,
        wallet: { balance: 0 }
      });
    }
  }
};
```

### Fix 4: Verify Backend Authentication Middleware

**File:** `backend/src/middleware/auth.js`

The middleware should:
1. Extract token from Authorization header
2. Verify token with JWT_SECRET
3. Attach user info to req.user
4. Return 401 if token is invalid

**Check:**
- JWT_SECRET is set in environment variables
- Token format is "Bearer <token>"
- Token hasn't expired (check JWT_EXPIRE setting)

## Immediate Actions to Take

### Step 1: Check Database
```sql
-- Check if your user exists
SELECT * FROM users WHERE email = 'your-actual-email@example.com';

-- Check if wallet exists for your user
SELECT u.email, w.* 
FROM users u 
LEFT JOIN wallets w ON u.id = w.user_id 
WHERE u.email = 'your-actual-email@example.com';

-- If wallet doesn't exist, create it
INSERT INTO wallets (user_id, balance, total_earned, total_withdrawn)
SELECT id, 0, 0, 0 FROM users WHERE email = 'your-actual-email@example.com';
```

### Step 2: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors when loading dashboard
4. Check Network tab for failed API requests
5. Look for 401 Unauthorized or 500 errors

### Step 3: Verify Token
1. Open DevTools → Application → Local Storage
2. Find `token` key
3. Copy the token value
4. Go to https://jwt.io
5. Paste token to decode it
6. Check if token is expired (exp field)
7. Verify user ID matches your user

### Step 4: Test API Directly
Use the backend test endpoint:
```
GET {BACKEND_URL}/api/user/profile
Headers: Authorization: Bearer YOUR_TOKEN_HERE
```

Expected response:
```json
{
  "id": 1,
  "email": "your-email@example.com",
  "fullName": "Your Name",
  "wallet": {
    "balance": 0,
    "totalEarned": 0,
    "totalWithdrawn": 0
  }
}
```

### Step 5: Re-login
Sometimes the simplest fix:
1. Log out completely
2. Clear browser cache and localStorage
3. Log in again
4. Check if email and balance now display correctly

## Prevention for Future Users

### Add to Registration Flow:
1. Always create wallet record when user registers
2. Always create user_profile record when user registers
3. Add database transaction to ensure all records created together
4. Return complete user object including wallet in registration response

### Add to Login Flow:
1. Verify all required records exist (user, wallet, profile)
2. Create missing records if needed
3. Return complete profile data in login response
4. Store complete user data in localStorage

### Add Better Error Messages:
1. Show specific error if wallet not found
2. Show specific error if authentication fails
3. Add retry mechanism for failed API calls
4. Add loading states while fetching data

## Quick Fix Script

Run this on your backend to fix existing users:

```javascript
// File: backend/fix-user-records.js
const pool = require('./src/config/database');

async function fixUserRecords() {
  const client = await pool.connect();
  try {
    // Get all users without wallets
    const usersWithoutWallets = await client.query(`
      SELECT u.id, u.email 
      FROM users u 
      LEFT JOIN wallets w ON u.id = w.user_id 
      WHERE w.id IS NULL
    `);
    
    console.log(`Found ${usersWithoutWallets.rows.length} users without wallets`);
    
    // Create wallets for them
    for (const user of usersWithoutWallets.rows) {
      await client.query(
        'INSERT INTO wallets (user_id, balance, total_earned, total_withdrawn) VALUES ($1, 0, 0, 0)',
        [user.id]
      );
      console.log(`Created wallet for user: ${user.email}`);
    }
    
    // Get all users without profiles
    const usersWithoutProfiles = await client.query(`
      SELECT u.id, u.email 
      FROM users u 
      LEFT JOIN user_profiles up ON u.id = up.user_id 
      WHERE up.id IS NULL
    `);
    
    console.log(`Found ${usersWithoutProfiles.rows.length} users without profiles`);
    
    // Create profiles for them
    for (const user of usersWithoutProfiles.rows) {
      await client.query(
        'INSERT INTO user_profiles (user_id) VALUES ($1)',
        [user.id]
      );
      console.log(`Created profile for user: ${user.email}`);
    }
    
    console.log('All user records fixed!');
  } catch (error) {
    console.error('Error fixing user records:', error);
  } finally {
    client.release();
  }
}

fixUserRecords();
```

Run with: `node backend/fix-user-records.js`
