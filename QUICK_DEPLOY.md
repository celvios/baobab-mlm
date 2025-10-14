# Quick Deploy Guide

## Step 1: Push to Git (Choose One)

**Option A - Use Script:**
```bash
git-push.bat
```

**Option B - Manual:**
```bash
git add .
git commit -m "Fix: Dashboard lock - new users show 'No Stage' correctly"
git push origin main
```

## Step 2: Run Migration on Render

### Via Render Shell:
1. Go to https://dashboard.render.com
2. Select your web service
3. Click "Shell" tab
4. Run:
```bash
psql $DATABASE_URL -f backend/database/fix-dashboard-lock.sql
```

### Via Direct SQL (Copy-Paste):
1. Go to Render Dashboard → PostgreSQL Database
2. Click "Connect" → Open external connection
3. Copy and paste from `render-migration.sql`

## Step 3: Verify
```bash
# In Render Shell
psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('dashboard_unlocked', 'deposit_confirmed');"
```

## Step 4: Test
1. Register new user
2. Check dashboard shows "No Stage" and is locked
3. Submit deposit
4. Verify still locked
5. Admin approves
6. Verify unlocked and shows "Feeder"

## Troubleshooting

**If migration fails:**
- Check if columns already exist
- Verify DATABASE_URL is correct
- Try running SQL commands one by one

**If users still show Feeder:**
- Clear browser cache
- Check backend logs
- Verify migration ran successfully

**Emergency Rollback:**
```sql
ALTER TABLE users DROP COLUMN dashboard_unlocked;
ALTER TABLE users DROP COLUMN deposit_confirmed;
```
