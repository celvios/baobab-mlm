# Phase 1 Deployment Guide - Render

## 🚀 Quick Deploy via URL

### Step 1: Run Migration Endpoint

Visit this URL in your browser (replace with your Render backend URL):

```
https://your-backend-url.onrender.com/api/migrate/run-phase1
```

This will:
- Add deposit columns to users table
- Create deposit_requests table
- Create matrix_positions table
- Update mlm_level default to 'no_stage'
- Create all necessary indexes

### Expected Response:
```json
{
  "success": true,
  "message": "Phase 1 migrations completed successfully"
}
```

## ✅ Verification

Check if migration worked:

```
https://your-backend-url.onrender.com/api/health
```

## 🔄 Rollback (If Needed)

If something goes wrong, contact database admin to run rollback script manually.

## 📝 What Changed

### Users Table:
- ✅ `deposit_amount` - Tracks deposit
- ✅ `deposit_confirmed` - Admin approval flag
- ✅ `deposit_confirmed_at` - Approval timestamp
- ✅ `dashboard_unlocked` - Controls access
- ✅ `mlm_level` default → 'no_stage'

### New Tables:
- ✅ `deposit_requests` - Deposit tracking
- ✅ `matrix_positions` - Pyramid positions

### Updated Tables:
- ✅ `stage_matrix` - Account completion tracking

## 🎯 Next Steps

After Phase 1 migration:
1. Test deposit endpoint
2. Verify dashboard lock works
3. Proceed to Phase 2 implementation

---

**Migration URL**: `/api/migrate/run-phase1`  
**Method**: POST  
**Auth**: None required (one-time setup)
