# Run MLM Migration

## After Deployment to Render

### Option 1: Use API Endpoint (Recommended)
Simply visit this URL in your browser or use curl:

```
POST https://your-render-url.onrender.com/api/migrate/run-mlm-migration
```

Or use curl:
```bash
curl -X POST https://your-render-url.onrender.com/api/migrate/run-mlm-migration
```

### Option 2: Run Locally
If testing locally:
```bash
cd backend
node run-mlm-migration.js
```

## What It Does
Creates 4 new tables:
- `mlm_matrix` - Matrix positions
- `referral_earnings` - Earnings records  
- `level_progressions` - Stage completions
- `stage_matrix` - Slot tracking per stage

## Verify Migration
Check if tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('mlm_matrix', 'referral_earnings', 'level_progressions', 'stage_matrix');
```

## After Migration
The MLM system will work automatically:
- Users pay → Placed in matrix
- Sponsor earns $1.50
- After 6 people → Auto-progress to Bronze
- After 14 more → Auto-progress to Silver
- And so on...

✅ Ready to push!
