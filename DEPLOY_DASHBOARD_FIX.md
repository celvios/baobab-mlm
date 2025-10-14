# Deploy Dashboard Lock Fix to Render

## Pre-Deployment Checklist
- ✅ Database migration file created
- ✅ Code fixes applied to controllers
- ✅ Schema updated for future deployments
- ✅ Fallback logic added for backward compatibility

## Deployment Steps

### 1. Commit and Push Changes
```bash
git add .
git commit -m "Fix: Dashboard lock issue - new users now show 'No Stage' correctly"
git push origin main
```

### 2. Run Database Migration on Render

**Option A - Via Render Shell:**
1. Go to Render Dashboard → Your Service
2. Click "Shell" tab
3. Run:
```bash
psql $DATABASE_URL -f backend/database/fix-dashboard-lock.sql
```

**Option B - Via Local Connection:**
```bash
# Get DATABASE_URL from Render environment variables
psql "your-render-database-url" -f backend/database/fix-dashboard-lock.sql
```

**Option C - Via Render PostgreSQL Dashboard:**
1. Go to Render Dashboard → Your PostgreSQL Database
2. Click "Connect" → "External Connection"
3. Use provided credentials with psql or pgAdmin
4. Execute the SQL from `fix-dashboard-lock.sql`

### 3. Verify Migration
```sql
-- Check if columns exist
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('dashboard_unlocked', 'deposit_confirmed', 'mlm_level');

-- Check user stages
SELECT id, email, mlm_level, dashboard_unlocked, deposit_confirmed 
FROM users 
LIMIT 5;
```

### 4. Restart Service
Render will auto-deploy after git push, or manually restart:
- Go to Render Dashboard → Your Service
- Click "Manual Deploy" → "Deploy latest commit"

## What Gets Fixed

### Before:
- ❌ New users show "Feeder" immediately
- ❌ Dashboard unlocked without deposit
- ❌ No distinction between paid/unpaid users

### After:
- ✅ New users show "No Stage"
- ✅ Dashboard locked until deposit approved
- ✅ Clear progression: No Stage → Deposit → Feeder

## Testing After Deployment

1. **Register New User:**
   - Should see "No Stage" status
   - Dashboard should be locked
   - "Make Deposit" button visible

2. **Submit Deposit:**
   - Upload payment proof
   - Dashboard remains locked
   - Status shows "Pending"

3. **Admin Approval:**
   - Admin approves deposit
   - Dashboard unlocks
   - User upgraded to "Feeder"

## Rollback Plan (If Needed)

If something goes wrong:
```sql
-- Rollback migration
ALTER TABLE users DROP COLUMN IF EXISTS dashboard_unlocked;
ALTER TABLE users DROP COLUMN IF EXISTS deposit_confirmed;
ALTER TABLE users ALTER COLUMN mlm_level SET DEFAULT 'feeder';
```

Then revert code:
```bash
git revert HEAD
git push origin main
```

## Environment Variables (Already Set)
No new environment variables needed. Existing setup works with fallback logic.

## Files Changed
- `backend/database/fix-dashboard-lock.sql` (new)
- `backend/database/schema.sql` (updated)
- `backend/src/controllers/authController.js` (updated)
- `backend/src/controllers/userController.js` (updated)
- `backend/src/controllers/depositController.js` (updated)
- `DASHBOARD_LOCK_FIX.md` (new)
- `apply-dashboard-fix.bat` (new)
