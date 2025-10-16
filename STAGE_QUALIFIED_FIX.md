# Stage-Qualified Matrix System Implementation

## What Changed

Your system now implements **stage-qualified progression** where users need people at the **SAME STAGE** to fill their matrix, not just any paid referrals.

## Key Changes

### 1. Database Migration (004_add_stage_qualified_tracking.sql)

**New column**: `qualified_slots_filled` in `stage_matrix` table
- Tracks how many **same-stage** members are in your matrix
- Separate from `slots_filled` which tracks total members

**New table**: `stage_matrix_members`
- Tracks which users are in which matrices
- Records if they're qualified (same stage) or not
- Enables retroactive updates when someone upgrades

### 2. MLM Service Logic (mlmService.js)

**Modified `creditUplineChain()`**:
- Now checks if new user is at the required stage
- Only increments `qualified_slots_filled` if stages match
- For `no_stage`: Any paid member counts (no qualification needed)
- For other stages: Only same-stage members count

**New `onUserStageUpgrade()`**:
- Triggers when someone upgrades stages
- Finds all upline users who have this person in their matrix
- Marks them as qualified and increments counters
- Checks if uplines can now progress

**Modified `checkLevelProgression()`**:
- Now uses `qualified_slots_filled` instead of `slots_filled`
- Only progresses when qualified members reach requirement

## How It Works

### Example: Feeder → Bronze Progression

**User A at Feeder stage (needs 6 Feeder-stage members)**

1. **Day 1**: User A refers 6 people who all pay
   - All 6 start at "No Stage"
   - User A's matrix: `slots_filled = 6`, `qualified_slots_filled = 0`
   - User A stays at Feeder ❌

2. **Day 5**: First person upgrades No Stage → Feeder
   - System finds User A has this person in their Feeder matrix
   - Increments User A's `qualified_slots_filled`: 0 → 1
   - User A still at Feeder (needs 6)

3. **Day 10**: All 6 people reach Feeder stage
   - Each upgrade triggers retroactive update
   - User A's `qualified_slots_filled`: 6
   - User A automatically upgrades to Bronze ✅

### Stage Qualification Rules

| Matrix Owner Stage | New Member Stage | Counts as Qualified? |
|-------------------|------------------|---------------------|
| No Stage | Any paid user | ✅ YES |
| Feeder | No Stage | ❌ NO |
| Feeder | Feeder | ✅ YES |
| Bronze | Feeder | ❌ NO |
| Bronze | Bronze | ✅ YES |
| Silver | Bronze | ❌ NO |
| Silver | Silver | ✅ YES |

## Installation Steps

### Step 1: Run Database Migration

```bash
cd backend
psql -U your_username -d baobab_mlm -f database/migrations/004_add_stage_qualified_tracking.sql
```

Or using Node:
```bash
node -e "const pool = require('./src/config/database'); const fs = require('fs'); const sql = fs.readFileSync('./database/migrations/004_add_stage_qualified_tracking.sql', 'utf8'); pool.query(sql).then(() => { console.log('Migration complete'); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });"
```

### Step 2: Restart Server

```bash
npm run dev
```

## Verification

### Check qualified vs total slots:
```sql
SELECT 
  u.email,
  u.mlm_level,
  sm.slots_filled as total_members,
  sm.qualified_slots_filled as qualified_members,
  sm.slots_required
FROM users u
JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = u.mlm_level
WHERE u.mlm_level != 'no_stage'
ORDER BY u.created_at DESC;
```

### Check matrix members:
```sql
SELECT 
  owner.email as matrix_owner,
  smm.matrix_stage,
  member.email as member_email,
  smm.member_stage_at_placement,
  smm.is_qualified
FROM stage_matrix_members smm
JOIN users owner ON smm.matrix_owner_id = owner.id
JOIN users member ON smm.member_id = member.id
ORDER BY owner.email, smm.created_at;
```

## Testing Scenarios

### Scenario 1: No Stage → Feeder (Should work as before)
- User gets 6 paid referrals
- All count immediately (no stage requirement)
- User upgrades to Feeder ✅

### Scenario 2: Feeder → Bronze (New behavior)
- User at Feeder gets 6 No-Stage referrals
- `qualified_slots_filled = 0` (none are Feeder yet)
- User stays at Feeder ❌
- When referrals upgrade to Feeder, counter increments
- At 6 qualified, user upgrades to Bronze ✅

### Scenario 3: Retroactive Updates
- User A at Bronze has 10 Feeder-stage members
- User B (one of the 10) upgrades Feeder → Bronze
- System finds User A's Bronze matrix has User B
- Increments User A's `qualified_slots_filled`: 0 → 1
- User A needs 13 more Bronze-stage members ✅

## API Response Changes

### GET /api/user/profile

Now returns:
```json
{
  "stageProgress": {
    "current_stage": "feeder",
    "slots_filled": 6,
    "qualified_slots_filled": 2,
    "slots_required": 6,
    "is_complete": false
  }
}
```

**Note**: 
- `slots_filled`: Total paid members in your matrix
- `qualified_slots_filled`: Members at your current stage
- `is_complete`: Based on `qualified_slots_filled`, not `slots_filled`

## Important Notes

1. **No Stage is special**: It doesn't require stage qualification, any paid member counts
2. **Retroactive updates**: When someone upgrades, all their uplines get credited automatically
3. **Existing data**: Run migration to add new columns, existing `slots_filled` preserved
4. **Performance**: New table tracks relationships, queries remain efficient with indexes

## Rollback (If Needed)

```sql
-- Remove new column
ALTER TABLE stage_matrix DROP COLUMN IF EXISTS qualified_slots_filled;

-- Drop new table
DROP TABLE IF EXISTS stage_matrix_members;

-- Revert to old logic (restore from git)
```
