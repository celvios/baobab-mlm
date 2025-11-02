# ✅ Spillover System - Render + Vercel Deployment

## 🎯 What You Need to Do

Since you're using **Render** (backend) and **Vercel** (frontend):

### Backend (Render) - 3 Steps

1. **Push code to Git**
   ```bash
   git add .
   git commit -m "Add spillover system"
   git push
   ```

2. **Wait for Render to deploy** (automatic)

3. **Run migration in Render Shell**
   ```bash
   node apply-spillover-migration.js
   ```

### Frontend (Vercel) - Nothing Yet!

The spillover system works entirely on the backend. Frontend updates are optional for now.

## 🚀 Easiest Way

**Just run this:**
```bash
deploy-spillover.bat
```

Then go to **Render Dashboard** → **Shell** → Run:
```bash
node apply-spillover-migration.js
```

## 📋 Step-by-Step

### Step 1: Commit & Push
```bash
git add .
git commit -m "Add spillover notification system"
git push origin main
```

### Step 2: Render Deploys
- Render detects the push
- Automatically builds and deploys
- Wait 2-3 minutes

### Step 3: Run Migration
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click your backend service
3. Click "Shell" tab
4. Run:
   ```bash
   node apply-spillover-migration.js
   ```

### Step 4: Verify
```bash
node test-spillover.js
```

## ✅ Environment Variables

Make sure these are set in Render:

| Variable | Example | Required |
|----------|---------|----------|
| `DATABASE_URL` | `postgresql://...` | ✅ Yes |
| `SENDGRID_API_KEY` | `SG.xxxxx` | ✅ Yes |
| `FROM_EMAIL` | `noreply@baobab.com` | ✅ Yes |
| `NODE_ENV` | `production` | ✅ Yes |

## 🧪 Test It

### Create Test Scenario
1. Register User A (get referral code)
2. Register Person 1 with User A's code
3. Register Person 2 with User A's code
4. Register Person 3 with User A's code ← **Triggers spillover!**

### Expected Results
- Person 1 receives email 📧
- Person 1 sees notification 🔔
- Person 3 appears in Person 1's team
- User A gets the bonus 💰

## 📊 Check If It's Working

### In Render Shell:
```bash
# Check table exists
psql $DATABASE_URL -c "\dt spillover_referrals"

# Count spillover records
psql $DATABASE_URL -c "SELECT COUNT(*) FROM spillover_referrals"

# View recent spillovers
psql $DATABASE_URL -c "SELECT * FROM spillover_referrals ORDER BY created_at DESC LIMIT 5"
```

### Check Logs:
- Render Dashboard → Logs
- Look for "spillover" messages

## 🎨 Frontend (Optional)

The backend is complete. When you want to add UI:

1. **Update Team Component**
   - Show "Spillover" badge
   - Display original referrer name
   - Show earning as "N/A"

2. **Push to Vercel**
   ```bash
   git push
   ```
   Vercel auto-deploys!

See [FRONTEND_SPILLOVER_GUIDE.md](FRONTEND_SPILLOVER_GUIDE.md) for details.

## 🐛 Common Issues

### Issue: Migration fails
**Solution:** It might have already run. Check:
```bash
psql $DATABASE_URL -c "\dt spillover_referrals"
```
If table exists, you're good!

### Issue: Emails not sending
**Solution:** Check SendGrid:
1. Verify `SENDGRID_API_KEY` is set
2. Verify `FROM_EMAIL` is verified in SendGrid
3. Check Render logs for errors

### Issue: Can't access Shell
**Solution:** 
- Free tier has limited Shell access
- Use direct database connection instead:
  ```bash
  psql YOUR_DATABASE_URL -f backend/database/migrations/add-spillover-tracking.sql
  ```

## 💡 Pro Tips

### Auto-Run Migration on Deploy
Add to `package.json`:
```json
{
  "scripts": {
    "postinstall": "node apply-spillover-migration.js || true"
  }
}
```

### Check Deployment Status
```bash
# View recent deployments
curl https://api.render.com/v1/services/YOUR_SERVICE_ID/deploys \
  -H "Authorization: Bearer YOUR_RENDER_API_KEY"
```

### Backup Database First
```bash
pg_dump $DATABASE_URL > backup_before_spillover.sql
```

## 📱 Mobile Testing

Test on mobile:
1. Register 3 users on phone
2. Check email on phone
3. Login and check notifications
4. View team on mobile

## 🎯 Deployment Checklist

- [ ] Code committed to Git
- [ ] Pushed to repository
- [ ] Render deployed successfully
- [ ] Migration ran in Shell
- [ ] Environment variables verified
- [ ] Test script passed
- [ ] Created 3 test referrals
- [ ] Verified email sent
- [ ] Checked database records
- [ ] Tested API endpoint

## 📞 Need Help?

### Quick Fixes
1. **Check Render Logs** - Most errors show here
2. **Verify Environment Variables** - Common issue
3. **Test Locally First** - Easier to debug

### Documentation
- [RENDER_QUICK_GUIDE.md](RENDER_QUICK_GUIDE.md) - Quick reference
- [DEPLOY_SPILLOVER_RENDER_VERCEL.md](DEPLOY_SPILLOVER_RENDER_VERCEL.md) - Detailed guide
- [SPILLOVER_SYSTEM.md](SPILLOVER_SYSTEM.md) - Full documentation

### Support
- Email: info@baobaworldwide.com
- Check Render community forum
- Review backend logs

## ✨ You're Ready!

**To deploy right now:**

1. Run `deploy-spillover.bat`
2. Go to Render Shell
3. Run `node apply-spillover-migration.js`
4. Test with 3 referrals

That's it! Your spillover system will be live! 🚀

---

**Platform:** Render + Vercel ✅
**Status:** Ready to Deploy ✅
**Time:** ~10 minutes ⏱️
