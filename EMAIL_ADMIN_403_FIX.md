# Email Management System - 403 Error Fix

## Problem
The admin email management system was showing a 403 error when trying to fetch users:
```
Error: Access denied. Admin privileges required.
Failed to load resource: the server responded with a status of 403
```

## Root Causes Identified

### 1. Token Storage Mismatch
- **Admin login** stores token as `adminToken` in localStorage
- **API service** was only checking for `token` in localStorage
- This caused authenticated admin requests to be sent without the Authorization header

### 2. JWT Payload Mismatch
- **Admin auth route** was signing JWT with `userId` field
- **Admin auth middleware** was expecting `id` field
- This caused token verification to fail even when the token was sent

## Fixes Applied

### Fix 1: Updated API Service Token Handling
**File**: `src/services/api.js`

Updated the API service to check for both `token` and `adminToken`:

```javascript
// In constructor
this.token = localStorage.getItem('token') || localStorage.getItem('adminToken');

// In getHeaders()
const token = this.token || localStorage.getItem('token') || localStorage.getItem('adminToken');
if (token) {
  headers.Authorization = `Bearer ${token}`;
}

// In adminLogin()
if (response.token) {
  this.token = response.token;
  localStorage.setItem('adminToken', response.token);
}
```

### Fix 2: Fixed JWT Token Payload
**File**: `backend/src/routes/adminAuth.js`

Changed JWT signing to use `id` instead of `userId`:

```javascript
// Before
const token = jwt.sign(
  { userId: admin.id, email: admin.email, role: 'admin' },
  process.env.JWT_SECRET || 'your-secret-key',
  { expiresIn: '24h' }
);

// After
const token = jwt.sign(
  { id: admin.id, email: admin.email, role: 'admin' },
  process.env.JWT_SECRET || 'your-secret-key',
  { expiresIn: '24h' }
);
```

## How It Works Now

1. Admin logs in via `/api/admin/auth/login`
2. JWT token is generated with correct payload (`id`, `email`, `role`)
3. Token is stored as `adminToken` in localStorage
4. API service checks for both `token` and `adminToken` when making requests
5. Admin middleware verifies token and checks for admin role
6. Request succeeds with proper authorization

## Testing

To verify the fix:

1. Log out of admin panel
2. Log back in
3. Navigate to Email Management → Mailing List
4. Users should now load without 403 error

## Additional Notes

- The fix maintains backward compatibility with regular user tokens
- Admin and user authentication systems remain separate
- No database changes were required
