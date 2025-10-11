# MLM Setup Guide - Quick Start

## Step 1: Run Database Migration

```bash
cd backend
node run-mlm-migration.js
```

This creates 4 new tables:
- `mlm_matrix` - Matrix positions
- `referral_earnings` - Earnings records
- `level_progressions` - Stage completions
- `stage_matrix` - Slot tracking per stage

## Step 2: Restart Backend

```bash
npm run dev
```

## Step 3: Test the Flow

### A. Register First User (Sponsor)
1. Go to `/register`
2. Register without referral code
3. Verify email with OTP
4. Upload payment proof (₦18,000)
5. Admin confirms payment
6. User is now in "Feeder" stage (0/6 slots)

### B. Register Second User (Referral)
1. Go to `/register?ref=SPONSOR_CODE`
2. Register with sponsor's referral code
3. Verify email with OTP
4. Upload payment proof (₦18,000)
5. Admin confirms payment
6. **MAGIC HAPPENS:**
   - User placed in sponsor's matrix
   - Sponsor earns $1.50
   - Sponsor's stage progress: 1/6 slots
   - User starts own Feeder stage: 0/6 slots

### C. Test Stage Progression
1. Register 6 users under the sponsor
2. After 6th user pays:
   - Sponsor auto-progresses to Bronze
   - Sponsor's new stage: 0/14 slots
   - Sponsor now earns $4.80 per person

## Step 4: Verify in Database

```sql
-- Check stage progress
SELECT u.full_name, u.mlm_level, sm.slots_filled, sm.slots_required
FROM users u
LEFT JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = u.mlm_level;

-- Check earnings
SELECT u.full_name, re.stage, COUNT(*) as people, SUM(re.amount) as total
FROM referral_earnings re
JOIN users u ON re.user_id = u.id
GROUP BY u.full_name, re.stage;

-- Check matrix structure
SELECT 
  u.full_name as user,
  p.full_name as parent,
  m.stage,
  m.position
FROM mlm_matrix m
JOIN users u ON m.user_id = u.id
LEFT JOIN users p ON m.parent_id = p.id;
```

## Step 5: Frontend Updates (Optional)

The backend is fully functional. Frontend updates are optional for better UX:

### Dashboard.js - Show Stage Progress
```javascript
const [stageProgress, setStageProgress] = useState(null);

useEffect(() => {
  const fetchProgress = async () => {
    const progress = await apiService.getStageProgress();
    setStageProgress(progress);
  };
  fetchProgress();
}, []);

// Display:
{stageProgress && (
  <div className="bg-white p-4 rounded-lg">
    <h3>Stage Progress</h3>
    <p>{stageProgress.currentStage.toUpperCase()}</p>
    <p>{stageProgress.slotsFilled} / {stageProgress.slotsRequired} slots filled</p>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-green-600 h-2 rounded-full" 
        style={{width: `${stageProgress.progress}%`}}
      />
    </div>
    <p className="text-sm text-gray-600">
      Next: {stageProgress.nextStage?.toUpperCase() || 'MAX LEVEL'}
    </p>
    <p className="text-sm">Earning ${stageProgress.bonusPerPerson} per person</p>
  </div>
)}
```

## Common Issues

### Issue: "relation mlm_matrix does not exist"
**Solution:** Run the migration script
```bash
node backend/run-mlm-migration.js
```

### Issue: User not placed in matrix after payment
**Solution:** Check if:
1. User has `referred_by` field set
2. Referrer exists and has valid referral code
3. Payment confirmation calls `mlmService.placeUserInMatrix()`

### Issue: Sponsor not receiving earnings
**Solution:** Check:
1. `referral_earnings` table has records
2. `wallets` table balance updated
3. `transactions` table has 'matrix_bonus' entries

## Testing Checklist

- [ ] Migration creates all 4 tables
- [ ] User registration works
- [ ] Email verification works
- [ ] Payment upload works
- [ ] Admin can confirm payment
- [ ] User set to "feeder" after payment
- [ ] Sponsor receives $1.50
- [ ] Sponsor's wallet balance increases
- [ ] Transaction record created
- [ ] After 6 people, sponsor progresses to Bronze
- [ ] Bronze stage earns $4.80 per person
- [ ] Frontend shows correct stage
- [ ] Frontend shows earnings

## Quick Test Script

```javascript
// Run in browser console on admin dashboard
async function testMLM() {
  // Get all users
  const users = await apiService.getAllUsers();
  console.log('Total users:', users.length);
  
  // Check stage distribution
  const stages = {};
  users.forEach(u => {
    stages[u.mlm_level] = (stages[u.mlm_level] || 0) + 1;
  });
  console.log('Stage distribution:', stages);
  
  // Check earnings
  const earnings = await apiService.getEarnings();
  console.log('My earnings:', earnings);
}

testMLM();
```

## What's Different Now?

### Before (Wrong):
- User needs 6 total referrals to reach Bronze
- User needs 20 total referrals to reach Silver
- Only direct referrals counted
- No spillover

### After (Correct):
- User needs 6 people in Feeder matrix → Bronze
- User needs 14 people in Bronze matrix → Silver
- Direct + spillover referrals counted
- Full 2x2/2x3 matrix structure
- Automatic stage progression

## Support

If you encounter issues:
1. Check `MLM_IMPLEMENTATION_SUMMARY.md` for detailed explanation
2. Check database tables exist
3. Check backend logs for errors
4. Verify payment confirmation triggers matrix placement
