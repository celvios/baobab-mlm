# Quick Fix Instructions - Matrix Stage Issue

## Problem
New users with 4 matrix slots are showing as "Feeder" instead of "No Stage".

## Solution Applied
✅ Fixed backend code to prevent auto-upgrade to Feeder
✅ Corrected matrix slot configuration (no_stage = 4 slots, feeder = 6 slots)
✅ Created database migration to fix existing users

## How to Apply the Fix

### Option 1: Run the Migration Script (Recommended)
```bash
cd backend
node run-stage-fix.js
```

This will:
- Update all stage_matrix entries with correct slot counts
- Reset incorrectly promoted users back to no_stage
- Sync slots_filled with actual paid referrals
- Show you a summary of changes

### Option 2: Manual SQL Execution
```bash
cd backend
psql -U your_username -d baobab_mlm -f database/fix-no-stage-matrix.sql
```

### Step 3: Restart Your Backend Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Verify the Fix

1. **Check a new user's stage:**
   - Register a new user
   - Login and check dashboard
   - Should show "No Stage" with 0/4 slots

2. **Check existing users:**
   - Users with less than 4 paid referrals should be at "No Stage"
   - Users with 4+ paid referrals should be at "Feeder"

## What Changed?

### Before (Incorrect):
- New user registers → Auto-upgraded to "Feeder" after 2 referrals
- Matrix showed 6 slots for no_stage (wrong)

### After (Correct):
- New user registers → Stays at "No Stage" until 4 paid referrals
- Matrix shows 4 slots for no_stage (correct 2x2 matrix)
- Only advances to Feeder after completing no_stage matrix

## Need Help?

If you encounter any issues:
1. Check the backend logs for errors
2. Verify database connection is working
3. Make sure all migrations have run successfully
4. Review the detailed documentation in `MATRIX_STAGE_FIX.md`

## Files Modified
- ✅ `backend/src/controllers/userController.js` - Removed auto-upgrade logic
- ✅ `backend/src/services/mlmService.js` - Fixed slot configuration
- ✅ `backend/database/fix-no-stage-matrix.sql` - Database migration
- ✅ `backend/run-stage-fix.js` - Migration runner script
