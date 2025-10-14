# Matrix Stage Fix - No Stage vs Feeder Issue

## Problem Identified

New users were being incorrectly shown as "Feeder" stage when they should be at "No Stage" with a 2x2 matrix (4 slots).

### Root Causes

1. **Auto-upgrade Logic in userController.js**
   - Lines 67-72 had logic that automatically upgraded users from `no_stage` to `feeder` when they had:
     - Paid joining fee OR balance >= 18000
     - 2 or more referrals
   - This bypassed the proper matrix completion system

2. **Incorrect Slot Configuration**
   - `no_stage` was configured with 6 slots instead of 4 slots (2x2 matrix)
   - This caused confusion in the matrix tracking system

3. **Missing Stage Matrix Entries**
   - Some users didn't have proper `stage_matrix` entries created with correct slot requirements

## MLM Structure (Correct)

| Stage     | Matrix Size | Slots Required | Bonus (USD) |
|-----------|-------------|----------------|-------------|
| no_stage  | 2x2         | 4              | $1.50       |
| feeder    | 2x2         | 6              | $1.50       |
| bronze    | 2x3         | 14             | $4.80       |
| silver    | 2x3         | 14             | $30.00      |
| gold      | 2x3         | 14             | $150.00     |
| diamond   | 2x3         | 14             | $750.00     |
| infinity  | unlimited   | 0              | $15,000.00  |

## Changes Made

### 1. Backend Controller Fix (userController.js)
**Removed:** Auto-upgrade logic that promoted users from no_stage to feeder based on referral count

```javascript
// REMOVED THIS CODE:
// Auto-advance to Feeder stage if registered + 2 referrals
if ((user.joining_fee_paid || walletData.balance >= 18000) && teamSize >= 2 && user.mlm_level === 'no_stage') {
  await pool.query(
    'UPDATE users SET mlm_level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    ['feeder', userId]
  );
  user.mlm_level = 'feeder';
}
```

**Why:** Users should only advance stages through the proper matrix completion system in mlmService.js

### 2. MLM Service Fix (mlmService.js)
**Updated:** MLM_LEVELS configuration to set correct slot requirements

```javascript
// BEFORE:
no_stage: { bonusUSD: 1.5, requiredReferrals: 6, matrixSize: '2x2' }

// AFTER:
no_stage: { bonusUSD: 1.5, requiredReferrals: 4, matrixSize: '2x2' }
```

**Updated:** Stage matrix creation to use correct slot counts based on stage

```javascript
// Now correctly assigns:
// - no_stage: 4 slots
// - feeder: 6 slots
// - bronze/silver/gold/diamond: 14 slots
```

### 3. Database Migration (fix-no-stage-matrix.sql)
Created migration script that:
- Updates stage_matrix entries to have correct slot requirements
- Resets users incorrectly promoted to feeder back to no_stage
- Creates missing stage_matrix entries
- Syncs slots_filled with actual paid referrals

## How to Apply the Fix

### Step 1: Update Backend Code
The code changes have already been applied to:
- `backend/src/controllers/userController.js`
- `backend/src/services/mlmService.js`

### Step 2: Run Database Migration
```bash
cd backend
psql -U your_username -d baobab_mlm -f database/fix-no-stage-matrix.sql
```

Or if using the app's database connection:
```bash
node -e "const pool = require('./src/config/database'); const fs = require('fs'); const sql = fs.readFileSync('./database/fix-no-stage-matrix.sql', 'utf8'); pool.query(sql).then(() => { console.log('Migration complete'); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });"
```

### Step 3: Restart Backend Server
```bash
npm run dev
```

## Verification

After applying the fix, verify:

1. **New users start at no_stage:**
   ```sql
   SELECT id, email, mlm_level FROM users WHERE created_at > NOW() - INTERVAL '1 day';
   ```

2. **Stage matrix has correct slots:**
   ```sql
   SELECT stage, slots_required, COUNT(*) 
   FROM stage_matrix 
   GROUP BY stage, slots_required;
   ```
   Expected:
   - no_stage: 4 slots
   - feeder: 6 slots
   - bronze/silver/gold/diamond: 14 slots

3. **Users only advance through matrix completion:**
   - Check that users at feeder have completed their no_stage matrix (4 paid referrals)
   - Check that progression is recorded in `level_progressions` table

## Expected Behavior After Fix

1. **New User Registration:**
   - User registers → starts at `no_stage`
   - User pays joining fee → remains at `no_stage`
   - Dashboard shows: "No Stage" with 0/4 slots filled

2. **Matrix Progression:**
   - User gets 4 paid referrals → matrix completes
   - System automatically upgrades to `feeder`
   - Dashboard shows: "Feeder" with 0/6 slots filled

3. **No Auto-Upgrades:**
   - Users will NOT be automatically upgraded based on referral count
   - Upgrades only happen through matrix completion in mlmService.checkLevelProgression()

## Testing Checklist

- [ ] New user registers and shows as "No Stage"
- [ ] User with 2 referrals stays at "No Stage" (not auto-upgraded to Feeder)
- [ ] User with 4 paid referrals gets upgraded to "Feeder"
- [ ] Stage matrix shows correct slot counts (4 for no_stage, 6 for feeder)
- [ ] Existing users are corrected by migration script
- [ ] Matrix completion triggers proper stage progression

## Notes

- The fix preserves the proper MLM matrix system where users must complete each stage before advancing
- Users who were incorrectly promoted will be reset to their proper stage based on actual matrix completion
- All future registrations will follow the correct progression path
