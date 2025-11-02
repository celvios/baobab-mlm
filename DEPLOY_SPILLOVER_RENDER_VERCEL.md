# Deploy Spillover System to Render + Vercel

## 🚀 Quick Deployment Guide

### Step 1: Deploy to Render (Backend)

#### Option A: Using Render Dashboard

1. **Go to your Render dashboard**
   - Navigate to your backend service

2. **Add Migration Script**
   - Go to "Shell" tab
   - Run this command:
   ```bash
   node apply-spillover-migration.js
   ```

3. **Verify Environment Variables**
   - Ensure these are set:
   ```
   DATABASE_URL=your_postgres_url
   SENDGRID_API_KEY=your_sendgrid_key
   FROM_EMAIL=noreply@baobab.com
   ```

4. **Redeploy**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Or push to your connected Git repo

#### Option B: Using Git Push

1. **Commit the changes**
   ```bash
   git add .
   git commit -m "Add spillover system"
   git push origin main
   ```

2. **Render auto-deploys** (if connected to Git)

3. **Run migration via Shell**
   - After deploy, go to Shell tab
   - Run: `node apply-spillover-migration.js`

### Step 2: Run Database Migration

**In Render Shell:**
```bash
cd backend
node apply-spillover-migration.js
```

**Or connect to your database directly:**
```bash
psql $DATABASE_URL -f backend/database/migrations/add-spillover-tracking.sql
```

### Step 3: Test Backend

**In Render Shell:**
```bash
node backend/test-spillover.js
```

### Step 4: Deploy to Vercel (Frontend)

Frontend doesn't need changes yet - spillover works on backend only!

**When you're ready to add UI:**
1. Update team display components
2. Add spillover badges
3. Push to Vercel (auto-deploys)

## 🔧 Render-Specific Setup

### Add Build Command (if needed)

In `render.yaml`:
```yaml
services:
  - type: web
    name: baobab-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: SENDGRID_API_KEY
        sync: false
      - key: FROM_EMAIL
        value: noreply@baobab.com
```

### Run Migration on Deploy

Add to `package.json`:
```json
{
  "scripts": {
    "postinstall": "node apply-spillover-migration.js || true"
  }
}
```

**Note:** The `|| true` prevents build failure if migration already ran.

## 📧 SendGrid Setup

1. **Get API Key**
   - Go to SendGrid dashboard
   - Create API key with "Mail Send" permissions

2. **Add to Render**
   - Go to Environment tab
   - Add `SENDGRID_API_KEY`
   - Add `FROM_EMAIL`

3. **Verify Sender**
   - Verify your FROM_EMAIL in SendGrid
   - Or use SendGrid's test email

## ✅ Verification Steps

### 1. Check Database
```bash
# In Render Shell
psql $DATABASE_URL -c "SELECT * FROM spillover_referrals LIMIT 1;"
```

### 2. Test API
```bash
curl https://your-backend.onrender.com/api/mlm/team \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Check Logs
- Go to Render dashboard
- Click "Logs" tab
- Look for spillover notifications

## 🐛 Troubleshooting

### Migration Fails
**Error:** Table already exists
**Solution:** Migration already ran, you're good!

**Error:** Connection refused
**Solution:** Check DATABASE_URL in environment variables

### Emails Not Sending
**Error:** SendGrid authentication failed
**Solution:** 
1. Verify SENDGRID_API_KEY is set
2. Check API key permissions
3. Verify FROM_EMAIL in SendGrid

### Spillover Not Working
**Check:**
1. Migration ran successfully
2. Backend redeployed after changes
3. Database has spillover_referrals table

## 📝 Deployment Checklist

- [ ] Commit spillover code to Git
- [ ] Push to repository
- [ ] Render auto-deploys (or manual deploy)
- [ ] Run migration in Render Shell
- [ ] Verify environment variables
- [ ] Test with 3 referrals
- [ ] Check email notifications
- [ ] Verify database records
- [ ] Update frontend (when ready)

## 🔄 Update Process

**For future updates:**

1. **Make changes locally**
2. **Test locally**
3. **Commit and push**
   ```bash
   git add .
   git commit -m "Update spillover system"
   git push
   ```
4. **Render auto-deploys**
5. **Run any new migrations if needed**

## 💡 Pro Tips

### Automatic Migrations
Add to `package.json`:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "migrate": "node apply-spillover-migration.js",
    "postinstall": "npm run migrate || true"
  }
}
```

### Environment-Specific Config
```javascript
// In apply-spillover-migration.js
const isProduction = process.env.NODE_ENV === 'production';
const ssl = isProduction ? { rejectUnauthorized: false } : false;
```

### Backup Before Migration
```bash
# In Render Shell
pg_dump $DATABASE_URL > backup.sql
```

## 🎯 Quick Commands

### Deploy Everything
```bash
# Local
git add .
git commit -m "Add spillover system"
git push

# Then in Render Shell
node apply-spillover-migration.js
node test-spillover.js
```

### Check Status
```bash
# Render Shell
node test-spillover.js
```

### View Spillovers
```bash
# Render Shell
psql $DATABASE_URL -c "
SELECT 
  ref.full_name as referrer,
  parent.full_name as placement_parent,
  member.full_name as spillover_member
FROM spillover_referrals sr
JOIN users ref ON sr.original_referrer_id = ref.id
JOIN users parent ON sr.placement_parent_id = parent.id
JOIN users member ON sr.referred_user_id = member.id
LIMIT 10;
"
```

## 🆘 Need Help?

1. **Check Render Logs**
   - Dashboard → Your Service → Logs

2. **Check Database**
   - Use Render Shell with psql

3. **Test Locally First**
   - Run migration locally
   - Test with local database
   - Then deploy to Render

## ✨ You're Done!

The spillover system is now live on Render. Test it by creating 3+ referrals!

---

**Backend:** Render ✅
**Frontend:** Vercel ✅
**Database:** PostgreSQL on Render ✅
**Emails:** SendGrid ✅
