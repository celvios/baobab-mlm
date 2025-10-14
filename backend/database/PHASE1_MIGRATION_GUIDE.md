# Phase 1: Database Migration Guide

## 📋 Overview
This guide covers running the Phase 1 database migrations for the MLM system redesign.

## 🗄️ What Gets Changed

### New Columns in `users` table:
- `deposit_amount` - Tracks deposit amount
- `deposit_confirmed` - Boolean flag for admin approval
- `deposit_confirmed_at` - Timestamp of approval
- `dashboard_unlocked` - Controls dashboard access
- `mlm_level` default changed from 'feeder' to 'no_stage'

### New Table: `deposit_requests`
Tracks all deposit submissions with proof and admin approval status.

### New Table: `matrix_positions`
Tracks user positions in pyramid matrix for spillover logic.

### Updated Table: `stage_matrix`
Added columns for account-based progression tracking.

## 🚀 Running Migrations

### Step 1: Backup Database
```bash
# Create backup before migration
pg_dump -U your_username baobab_mlm > backup_before_phase1.sql
```

### Step 2: Run Migrations
```bash
cd backend/database/migrations
node run-migrations.js
```

### Expected Output:
```
🚀 Starting Phase 1 migrations...

📦 Running migration 001: Add Deposit System...
✅ Migration 001 completed

📦 Running migration 002: Add Matrix Positions...
✅ Migration 002 completed

🎉 All Phase 1 migrations completed successfully!
```

## ⚠️ Rollback (If Needed)

If something goes wrong:
```bash
cd backend/database/migrations
node rollback-migrations.js
```

Or restore from backup:
```bash
psql -U your_username baobab_mlm < backup_before_phase1.sql
```

## ✅ Verification

After migration, verify tables exist:
```sql
-- Check new columns in users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('deposit_amount', 'deposit_confirmed', 'dashboard_unlocked');

-- Check deposit_requests table
SELECT * FROM deposit_requests LIMIT 1;

-- Check matrix_positions table
SELECT * FROM matrix_positions LIMIT 1;
```

## 📊 Post-Migration Tasks

### Update Existing Users (Optional)
If you want existing users to keep dashboard access:
```sql
-- Keep existing users unlocked
UPDATE users 
SET dashboard_unlocked = TRUE, 
    deposit_confirmed = TRUE,
    deposit_amount = 18000
WHERE created_at < NOW();
```

Or lock all users:
```sql
-- Lock all users (they must deposit)
UPDATE users 
SET dashboard_unlocked = FALSE, 
    deposit_confirmed = FALSE,
    mlm_level = 'no_stage';
```

## 🔍 Troubleshooting

### Error: "relation already exists"
The migration is idempotent. Safe to run multiple times.

### Error: "column already exists"
Use `IF NOT EXISTS` clauses handle this. Check migration files.

### Error: "permission denied"
Ensure database user has CREATE TABLE and ALTER TABLE permissions.

## ✅ Phase 1 Complete Checklist

- [ ] Database backup created
- [ ] Migrations run successfully
- [ ] New tables verified
- [ ] New columns verified
- [ ] Indexes created
- [ ] Existing user data handled
- [ ] Ready for Phase 2

## 🎯 Next Steps

Once Phase 1 is complete, proceed to:
- **Phase 2**: Deposit System Backend Implementation
