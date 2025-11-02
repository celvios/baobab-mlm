# 🚀 Render Deployment - Quick Guide

## One-Command Deploy

```bash
# Run this:
deploy-spillover.bat
```

Then in **Render Shell**:
```bash
node apply-spillover-migration.js
```

## Manual Steps

### 1. Push Code
```bash
git add .
git commit -m "Add spillover system"
git push
```

### 2. Render Auto-Deploys
Wait for deployment to complete (check Render dashboard)

### 3. Run Migration
In **Render Shell**:
```bash
node apply-spillover-migration.js
```

### 4. Test
```bash
node test-spillover.js
```

## Environment Variables (Check These)

Go to Render Dashboard → Environment:

```
DATABASE_URL=postgresql://...
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=noreply@baobab.com
NODE_ENV=production
```

## Verify It Works

### Check Database
```bash
psql $DATABASE_URL -c "\dt spillover_referrals"
```

### Check API
```bash
curl https://your-app.onrender.com/api/mlm/team \
  -H "Authorization: Bearer TOKEN"
```

### Test Spillover
1. Create user with referral code
2. Register 3 people with that code
3. Check 3rd person triggers spillover
4. Verify email sent

## Troubleshooting

### "Table already exists"
✅ Good! Migration already ran

### "Connection refused"
❌ Check DATABASE_URL in environment

### "SendGrid error"
❌ Check SENDGRID_API_KEY and FROM_EMAIL

### "Module not found"
❌ Redeploy or run `npm install` in Shell

## Quick Commands

| Task | Command |
|------|---------|
| Deploy | `git push` |
| Migrate | `node apply-spillover-migration.js` |
| Test | `node test-spillover.js` |
| Check DB | `psql $DATABASE_URL -c "SELECT COUNT(*) FROM spillover_referrals"` |
| View Logs | Render Dashboard → Logs |

## That's It!

Your spillover system is now live on Render! 🎉

---

**Need help?** See [DEPLOY_SPILLOVER_RENDER_VERCEL.md](DEPLOY_SPILLOVER_RENDER_VERCEL.md)
