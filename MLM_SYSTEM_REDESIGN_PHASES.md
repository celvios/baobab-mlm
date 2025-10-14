# Baobab MLM System Redesign - Phase Breakdown

## 🔴 CRITICAL SYSTEM CHANGES REQUIRED

### Current System Issues:
1. ❌ Users can access all dashboard features immediately after registration
2. ❌ No deposit requirement enforcement ($18,000 minimum)
3. ❌ Matrix progression is based on individual referrals, not account completion
4. ❌ No "No Stage" level implementation
5. ❌ Spillover system not properly implemented (left-to-right pyramid filling)
6. ❌ Team tree shows binary structure instead of pyramid (2x2, 2x3)

---

## 📋 NEW SYSTEM REQUIREMENTS SUMMARY

### User Journey:
1. **Registration** → User starts at "No Stage" level
2. **Deposit $18,000+** → Unlocks all dashboard features + moves to Feeder stage
3. **Feeder Stage (2x2 Matrix)** → Register 2 direct referrals who each register 2 more = 6 total accounts
4. **Bronze Stage (2x3 Matrix)** → Need 14 completed Feeder accounts under you
5. **Silver Stage (2x3 Matrix)** → Need 14 completed Bronze accounts under you
6. **Gold Stage (2x3 Matrix)** → Need 14 completed Gold accounts under you
7. **Diamond Stage (2x3 Matrix)** → Need 14 completed Diamond accounts under you
8. **Infinity Stage** → Earn $15,000 per person indefinitely

### Key Rules:
- **Spillover**: If you register more than 2 people, extras fill slots under your downline (left-to-right)
- **Progression**: Based on COMPLETED ACCOUNTS at previous stage, not individual referrals
- **Pyramid Structure**: Visual representation should show pyramid, not binary tree

---

## 🎯 PHASE 1: Core System Foundation (CRITICAL)

### 1.1 Database Schema Updates
**Files to modify:**
- `backend/database/schema.sql`
- `backend/database/mlm-tables.sql`

**Changes:**
```sql
-- Add new columns to users table
ALTER TABLE users ADD COLUMN deposit_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN deposit_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN deposit_confirmed_at TIMESTAMP;
ALTER TABLE users ADD COLUMN dashboard_unlocked BOOLEAN DEFAULT FALSE;

-- Update mlm_level default to 'no_stage'
ALTER TABLE users ALTER COLUMN mlm_level SET DEFAULT 'no_stage';

-- Add deposit_requests table
CREATE TABLE deposit_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    proof_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending',
    confirmed_by INTEGER REFERENCES admin_users(id),
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update stage_matrix table to track account-based progression
ALTER TABLE stage_matrix ADD COLUMN completed_accounts_count INTEGER DEFAULT 0;
ALTER TABLE stage_matrix ADD COLUMN required_completed_accounts INTEGER DEFAULT 0;

-- Add matrix_positions table for spillover tracking
CREATE TABLE matrix_positions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    stage VARCHAR(50) NOT NULL,
    position_path VARCHAR(255), -- e.g., "L", "R", "LL", "LR", "RL", "RR"
    parent_user_id INTEGER REFERENCES users(id),
    level_in_matrix INTEGER DEFAULT 1,
    is_filled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Deliverables:**
- ✅ Migration script for database changes
- ✅ Updated schema.sql file
- ✅ Rollback script (in case of issues)

---

## 🎯 PHASE 2: Deposit System & Dashboard Lock

### 2.1 Backend - Deposit Request System
**Files to create/modify:**
- `backend/src/controllers/depositController.js` (NEW)
- `backend/src/routes/deposit.js` (NEW)
- `backend/src/middleware/dashboardAccess.js` (NEW)

**Features:**
- Deposit request submission with proof upload
- Admin approval system for deposits
- Automatic dashboard unlock when deposit ≥ $18,000 confirmed
- Automatic stage progression from "no_stage" to "feeder"

### 2.2 Frontend - Deposit Modal & Dashboard Lock
**Files to modify:**
- `src/components/DepositModal.js` - Update to handle initial deposit
- `src/pages/Dashboard.js` - Add dashboard lock logic
- `src/pages/Team.js` - Add dashboard lock logic
- `src/pages/Products.js` - Add dashboard lock logic
- `src/pages/History.js` - Add dashboard lock logic
- `src/pages/Incentives.js` - Add dashboard lock logic
- `src/pages/RankingsEarnings.js` - Add dashboard lock logic

**UI Changes:**
- Show "Deposit Required" overlay on all pages except deposit page
- Display deposit status banner
- Only allow deposit function until confirmed

**Deliverables:**
- ✅ Deposit request API endpoints
- ✅ Dashboard access middleware
- ✅ Frontend dashboard lock component
- ✅ Deposit confirmation flow
- ✅ Admin deposit approval interface

---

## 🎯 PHASE 3: Pyramid Matrix System (2x2 & 2x3)

### 3.1 Backend - Matrix Logic Rewrite
**Files to create/modify:**
- `backend/src/services/matrixService.js` (REWRITE)
- `backend/src/services/spilloverService.js` (NEW)
- `backend/src/controllers/mlmController.js` (UPDATE)

**Core Logic:**
```javascript
// Feeder: 2x2 Matrix (6 slots)
// Level 1: 2 direct referrals
// Level 2: 4 spillover slots (2 under each direct)

// Bronze/Silver/Gold/Diamond: 2x3 Matrix (14 slots)
// Level 1: 2 direct
// Level 2: 4 spillover (2 under each)
// Level 3: 8 spillover (2 under each of level 2)
```

**Spillover Algorithm:**
1. User registers someone
2. If user has < 2 direct slots → place directly under user
3. If user has 2 direct slots filled → find first available slot in downline (left-to-right, depth-first)
4. Track position path (L, R, LL, LR, RL, RR, etc.)

### 3.2 Account-Based Progression System
**Files to create/modify:**
- `backend/src/services/progressionService.js` (NEW)

**Logic:**
- Track completed accounts at each stage
- Feeder → Bronze: Need 14 accounts that completed Feeder (2x2)
- Bronze → Silver: Need 14 accounts that completed Bronze (2x3)
- Silver → Gold: Need 14 accounts that completed Silver (2x3)
- Gold → Diamond: Need 14 accounts that completed Gold (2x3)
- Diamond → Infinity: Completed Diamond

**Deliverables:**
- ✅ Matrix position tracking system
- ✅ Spillover placement algorithm
- ✅ Account completion tracking
- ✅ Stage progression based on completed accounts
- ✅ API endpoints for matrix data

---

## 🎯 PHASE 4: Frontend - Pyramid Tree Visualization

### 4.1 Team Tree Redesign
**Files to modify:**
- `src/pages/TeamTree.js` (MAJOR REWRITE)

**Changes:**
- Replace binary tree with pyramid structure
- Show 2x2 matrix for Feeder stage
- Show 2x3 matrix for Bronze/Silver/Gold/Diamond stages
- Visual indicators for:
  - Filled slots (green)
  - Empty slots (gray/dashed)
  - Spillover members (different color)
  - Completed accounts (badge/icon)

**Visual Structure:**
```
Feeder (2x2):
       YOU
      /   \
    L       R
   / \     / \
  LL LR   RL RR

Bronze/Silver/Gold/Diamond (2x3):
           YOU
          /   \
        L       R
       / \     / \
      LL LR   RL RR
     /\ /\   /\ /\
   ... (8 more slots)
```

### 4.2 Dashboard Updates
**Files to modify:**
- `src/pages/Dashboard.js`
- `src/pages/Team.js`
- `src/pages/RankingsEarnings.js`

**Changes:**
- Update stage display to show "No Stage" properly
- Show deposit status prominently
- Display matrix completion progress
- Show completed accounts count for progression

**Deliverables:**
- ✅ Pyramid tree visualization component
- ✅ Matrix slot indicators
- ✅ Completed accounts counter
- ✅ Stage progression tracker UI

---

## 🎯 PHASE 5: Earnings Calculation Update

### 5.1 Backend - Earnings Recalculation
**Files to modify:**
- `backend/src/services/earningsService.js` (UPDATE)
- `backend/src/controllers/walletController.js` (UPDATE)

**New Earnings Structure:**
```javascript
const STAGE_EARNINGS = {
  feeder: 1.5,      // $1.5 per person (6 people = $9)
  bronze: 4.8,      // $4.8 per person (14 people = $67.2)
  silver: 30,       // $30 per person (14 people = $420)
  gold: 150,        // $150 per person (14 people = $2,100)
  diamond: 750,     // $750 per person (14 people = $10,500)
  infinity: 15000   // $15,000 per person (indefinite)
};
```

**Logic:**
- Only count earnings from users who have deposited $18k+
- Track earnings per stage separately
- Update wallet when matrix slots are filled
- Bonus when stage is completed

**Deliverables:**
- ✅ Updated earnings calculation
- ✅ Stage-based commission tracking
- ✅ Wallet update triggers
- ✅ Transaction history updates

---

## 🎯 PHASE 6: Admin Panel Updates

### 6.1 Deposit Approval System
**Files to create/modify:**
- `src/pages/admin/AdminDeposits.js` (NEW)
- `backend/src/controllers/adminDepositController.js` (NEW)

**Features:**
- View all pending deposit requests
- Approve/reject deposits
- View deposit proof images
- Bulk approval functionality
- Deposit history and reports

### 6.2 User Management Updates
**Files to modify:**
- `src/pages/admin/AdminUsers.js`
- Backend admin user controller

**New Features:**
- View user deposit status
- Manually unlock dashboard (emergency)
- View user's matrix position
- View completed accounts count
- Force stage progression (admin override)

**Deliverables:**
- ✅ Admin deposit approval interface
- ✅ Deposit request management
- ✅ Enhanced user management tools
- ✅ Matrix visualization in admin panel

---

## 🎯 PHASE 7: Testing & Validation

### 7.1 Unit Tests
- Matrix placement algorithm
- Spillover logic
- Account completion tracking
- Stage progression logic
- Earnings calculation

### 7.2 Integration Tests
- Deposit → Dashboard unlock flow
- Registration → Matrix placement
- Matrix completion → Stage progression
- Earnings → Wallet update

### 7.3 User Acceptance Testing
- Complete user journey from registration to Diamond
- Test with multiple users simultaneously
- Verify spillover works correctly
- Validate earnings calculations

**Deliverables:**
- ✅ Test suite for all new features
- ✅ Test data generation scripts
- ✅ UAT checklist
- ✅ Bug fixes from testing

---

## 🎯 PHASE 8: Migration & Deployment

### 8.1 Data Migration
**Tasks:**
- Migrate existing users to new schema
- Set existing users to appropriate stages
- Recalculate matrix positions
- Update earnings based on new structure

### 8.2 Deployment
**Tasks:**
- Database migration scripts
- Backend deployment
- Frontend deployment
- Rollback plan

**Deliverables:**
- ✅ Migration scripts
- ✅ Deployment checklist
- ✅ Rollback procedures
- ✅ Production monitoring setup

---

## 📊 SUMMARY OF CHANGES BY FILE

### Backend Files to Modify:
1. `database/schema.sql` - Add deposit columns, update defaults
2. `database/mlm-tables.sql` - Add new tables for matrix tracking
3. `src/controllers/depositController.js` - NEW
4. `src/controllers/mlmController.js` - UPDATE matrix logic
5. `src/services/matrixService.js` - REWRITE
6. `src/services/spilloverService.js` - NEW
7. `src/services/progressionService.js` - NEW
8. `src/services/earningsService.js` - UPDATE
9. `src/middleware/dashboardAccess.js` - NEW
10. `src/routes/deposit.js` - NEW

### Frontend Files to Modify:
1. `src/pages/Dashboard.js` - Add dashboard lock
2. `src/pages/Team.js` - Add dashboard lock
3. `src/pages/TeamTree.js` - MAJOR REWRITE (pyramid structure)
4. `src/pages/Products.js` - Add dashboard lock
5. `src/pages/History.js` - Add dashboard lock
6. `src/pages/Incentives.js` - Add dashboard lock
7. `src/pages/RankingsEarnings.js` - Add dashboard lock, update display
8. `src/components/DepositModal.js` - UPDATE
9. `src/components/DashboardLock.js` - NEW
10. `src/pages/admin/AdminDeposits.js` - NEW
11. `src/pages/admin/AdminUsers.js` - UPDATE

---

## ⏱️ ESTIMATED TIMELINE

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1: Database Schema | 2-3 days | 🔴 CRITICAL |
| Phase 2: Deposit System | 3-4 days | 🔴 CRITICAL |
| Phase 3: Matrix System | 5-7 days | 🔴 CRITICAL |
| Phase 4: Frontend Tree | 4-5 days | 🟡 HIGH |
| Phase 5: Earnings Update | 3-4 days | 🟡 HIGH |
| Phase 6: Admin Panel | 3-4 days | 🟢 MEDIUM |
| Phase 7: Testing | 4-5 days | 🔴 CRITICAL |
| Phase 8: Migration | 2-3 days | 🔴 CRITICAL |

**Total Estimated Time: 26-35 days**

---

## 🚀 RECOMMENDED EXECUTION ORDER

1. **Week 1**: Phase 1 + Phase 2 (Foundation + Deposit System)
2. **Week 2**: Phase 3 (Matrix System Backend)
3. **Week 3**: Phase 4 + Phase 5 (Frontend + Earnings)
4. **Week 4**: Phase 6 + Phase 7 (Admin + Testing)
5. **Week 5**: Phase 8 + Buffer (Migration + Fixes)

---

## ⚠️ CRITICAL CONSIDERATIONS

1. **Data Integrity**: Existing users need careful migration
2. **Backward Compatibility**: May need to maintain old system temporarily
3. **Performance**: Matrix calculations can be expensive - consider caching
4. **User Communication**: Clear messaging about system changes
5. **Admin Training**: New deposit approval process needs documentation

---

## 📝 NEXT STEPS

1. ✅ Review and approve this phase breakdown
2. ⏳ Set up development environment
3. ⏳ Create detailed technical specifications for Phase 1
4. ⏳ Begin database schema updates
5. ⏳ Set up testing framework

---

**Document Version**: 1.0  
**Last Updated**: 2025  
**Status**: Awaiting Approval
