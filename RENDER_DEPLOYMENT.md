# Render Deployment - Matrix Stage Fix

## Step 1: Push to GitHub
Run the batch script:
```bash
push-stage-fix.bat
```

Or manually:
```bash
git add .
git commit -m "Fix: Correct matrix stage progression"
git push origin main
```

## Step 2: Wait for Render Auto-Deploy
- Render will automatically detect the push and deploy
- Wait for deployment to complete (check Render dashboard)

## Step 3: Run Migration on Render

### Option A: Using Render Shell
1. Go to Render Dashboard: https://dashboard.render.com
2. Select your backend service
3. Click "Shell" tab
4. Run:
```bash
node run-stage-fix.js
```

### Option B: Using Render API (if shell not available)
1. Go to your service settings
2. Add a manual deploy hook
3. Or SSH into the service if configured

## Step 4: Verify
Check your app - new users should now show "No Stage" with 4 slots.

## Important Notes
- The code changes will auto-deploy via Render
- The database migration must be run manually once
- Migration is safe to run multiple times (idempotent)
