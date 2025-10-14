# Technical Implementation Guide - MLM System Redesign

## 🔧 PHASE 1: Database Schema Implementation

### Step 1.1: Create Migration Script

**File**: `backend/database/migrations/001_add_deposit_system.sql`

```sql
-- Add deposit-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deposit_confirmed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS dashboard_unlocked BOOLEAN DEFAULT FALSE;

-- Update default mlm_level to no_stage
ALTER TABLE users ALTER COLUMN mlm_level SET DEFAULT 'no_stage';

-- Update existing users (optional - based on business decision)
UPDATE users SET mlm_level = 'no_stage' WHERE mlm_level IS NULL;

-- Create deposit_requests table
CREATE TABLE IF NOT EXISTS deposit_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 18000),
    proof_url VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    confirmed_by INTEGER REFERENCES admin_users(id),
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user ON deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON deposit_requests(status);
CREATE INDEX IF NOT EXISTS idx_users_dashboard_unlocked ON users(dashboard_unlocked);
```

### Step 1.2: Matrix Position Tracking

**File**: `backend/database/migrations/002_add_matrix_positions.sql`

```sql
-- Create matrix_positions table for spillover tracking
CREATE TABLE IF NOT EXISTS matrix_positions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL CHECK (stage IN ('feeder', 'bronze', 'silver', 'gold', 'diamond', 'infinity')),
    position_path VARCHAR(255) NOT NULL,
    parent_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    level_in_matrix INTEGER DEFAULT 1 CHECK (level_in_matrix >= 1),
    is_filled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, stage)
);

-- Update stage_matrix table
ALTER TABLE stage_matrix 
ADD COLUMN IF NOT EXISTS completed_accounts_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS required_completed_accounts INTEGER DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_matrix_positions_user ON matrix_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_matrix_positions_parent ON matrix_positions(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_matrix_positions_stage ON matrix_positions(stage);
```

### Step 1.3: Run Migration

```bash
# From backend directory
psql -U your_username -d baobab_mlm -f database/migrations/001_add_deposit_system.sql
psql -U your_username -d baobab_mlm -f database/migrations/002_add_matrix_positions.sql
```

---

## 🔧 PHASE 2: Backend - Deposit System

### Step 2.1: Create Deposit Controller

**File**: `backend/src/controllers/depositController.js`

```javascript
const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

// Submit deposit request
exports.submitDeposit = async (req, res) => {
  const userId = req.user.id;
  const { amount } = req.body;
  
  try {
    // Validate amount
    if (!amount || parseFloat(amount) < 18000) {
      return res.status(400).json({ 
        error: 'Minimum deposit amount is $18,000' 
      });
    }
    
    // Check if proof file uploaded
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Payment proof is required' 
      });
    }
    
    const proofUrl = `/uploads/deposit-proofs/${req.file.filename}`;
    
    // Check if user already has pending deposit
    const existingDeposit = await pool.query(
      'SELECT * FROM deposit_requests WHERE user_id = $1 AND status = $2',
      [userId, 'pending']
    );
    
    if (existingDeposit.rows.length > 0) {
      return res.status(400).json({ 
        error: 'You already have a pending deposit request' 
      });
    }
    
    // Create deposit request
    const result = await pool.query(
      `INSERT INTO deposit_requests (user_id, amount, proof_url, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, amount, proofUrl, 'pending']
    );
    
    res.json({
      message: 'Deposit request submitted successfully',
      deposit: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error submitting deposit:', error);
    res.status(500).json({ error: 'Failed to submit deposit request' });
  }
};

// Get user's deposit status
exports.getDepositStatus = async (req, res) => {
  const userId = req.user.id;
  
  try {
    const result = await pool.query(
      `SELECT dr.*, u.dashboard_unlocked, u.deposit_confirmed, u.mlm_level
       FROM deposit_requests dr
       JOIN users u ON u.id = dr.user_id
       WHERE dr.user_id = $1
       ORDER BY dr.created_at DESC
       LIMIT 1`,
      [userId]
    );
    
    res.json({
      deposit: result.rows[0] || null,
      dashboardUnlocked: result.rows[0]?.dashboard_unlocked || false
    });
    
  } catch (error) {
    console.error('Error getting deposit status:', error);
    res.status(500).json({ error: 'Failed to get deposit status' });
  }
};
```

### Step 2.2: Create Deposit Routes

**File**: `backend/src/routes/deposit.js`

```javascript
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const depositController = require('../controllers/depositController');
const auth = require('../middleware/auth');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/deposit-proofs/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'deposit-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
});

// Routes
router.post('/submit', auth, upload.single('proof'), depositController.submitDeposit);
router.get('/status', auth, depositController.getDepositStatus);

module.exports = router;
```

### Step 2.3: Create Dashboard Access Middleware

**File**: `backend/src/middleware/dashboardAccess.js`

```javascript
const pool = require('../config/database');

const checkDashboardAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user's dashboard status
    const result = await pool.query(
      'SELECT dashboard_unlocked, deposit_confirmed FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // Check if dashboard is unlocked
    if (!user.dashboard_unlocked || !user.deposit_confirmed) {
      return res.status(403).json({ 
        error: 'Dashboard locked',
        message: 'Please deposit $18,000 to unlock dashboard features',
        dashboardLocked: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Dashboard access check error:', error);
    res.status(500).json({ error: 'Failed to verify dashboard access' });
  }
};

module.exports = checkDashboardAccess;
```

### Step 2.4: Update Server Routes

**File**: `backend/src/server.js` (add these lines)

```javascript
const depositRoutes = require('./routes/deposit');
const checkDashboardAccess = require('./middleware/dashboardAccess');

// Deposit routes (no dashboard lock)
app.use('/api/deposit', depositRoutes);

// Protected routes (require dashboard unlock)
app.use('/api/products', checkDashboardAccess);
app.use('/api/orders', checkDashboardAccess);
app.use('/api/withdrawal', checkDashboardAccess);
app.use('/api/mlm/team', checkDashboardAccess);
```

---

## 🔧 PHASE 3: Backend - Matrix System

### Step 3.1: Matrix Service

**File**: `backend/src/services/matrixService.js`

```javascript
const pool = require('../config/database');

class MatrixService {
  
  // Get matrix configuration for stage
  getMatrixConfig(stage) {
    const configs = {
      feeder: { levels: 2, width: 2, totalSlots: 6, earningPerSlot: 1.5 },
      bronze: { levels: 3, width: 2, totalSlots: 14, earningPerSlot: 4.8 },
      silver: { levels: 3, width: 2, totalSlots: 14, earningPerSlot: 30 },
      gold: { levels: 3, width: 2, totalSlots: 14, earningPerSlot: 150 },
      diamond: { levels: 3, width: 2, totalSlots: 14, earningPerSlot: 750 },
      infinity: { levels: 3, width: 2, totalSlots: 14, earningPerSlot: 15000 }
    };
    return configs[stage] || configs.feeder;
  }
  
  // Find next available position in matrix
  async findNextPosition(parentUserId, stage) {
    const config = this.getMatrixConfig(stage);
    
    // Get all positions in parent's matrix
    const positions = await pool.query(
      `SELECT position_path FROM matrix_positions 
       WHERE parent_user_id = $1 AND stage = $2
       ORDER BY position_path`,
      [parentUserId, stage]
    );
    
    // Generate all possible positions
    const allPositions = this.generateAllPositions(config.levels);
    
    // Find first available position
    const occupiedPaths = positions.rows.map(p => p.position_path);
    const availablePosition = allPositions.find(pos => !occupiedPaths.includes(pos));
    
    return availablePosition || null;
  }
  
  // Generate all position paths for matrix
  generateAllPositions(levels) {
    const positions = [];
    
    function generate(path, level) {
      if (level > levels) return;
      
      if (level > 0) {
        positions.push(path);
      }
      
      if (level < levels) {
        generate(path + 'L', level + 1);
        generate(path + 'R', level + 1);
      }
    }
    
    generate('', 0);
    return positions;
  }
  
  // Place user in matrix
  async placeInMatrix(userId, sponsorId, stage) {
    try {
      // Find next available position
      const position = await this.findNextPosition(sponsorId, stage);
      
      if (!position) {
        throw new Error('No available positions in matrix');
      }
      
      // Calculate level from position path
      const level = position.length;
      
      // Insert position
      await pool.query(
        `INSERT INTO matrix_positions (user_id, stage, position_path, parent_user_id, level_in_matrix)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, stage, position, sponsorId, level]
      );
      
      // Update sponsor's earnings
      await this.updateEarnings(sponsorId, userId, stage);
      
      return { position, level };
      
    } catch (error) {
      console.error('Error placing in matrix:', error);
      throw error;
    }
  }
  
  // Update earnings when slot is filled
  async updateEarnings(sponsorId, newUserId, stage) {
    const config = this.getMatrixConfig(stage);
    const amount = config.earningPerSlot;
    
    await pool.query('BEGIN');
    
    try {
      // Add to wallet
      await pool.query(
        `UPDATE wallets 
         SET balance = balance + $1, 
             total_earned = total_earned + $1
         WHERE user_id = $2`,
        [amount, sponsorId]
      );
      
      // Record transaction
      await pool.query(
        `INSERT INTO transactions (user_id, type, amount, description, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [sponsorId, 'mlm_earning', amount, `Earned from ${stage} matrix`, 'completed']
      );
      
      // Record referral earning
      await pool.query(
        `INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [sponsorId, newUserId, stage, amount, 'completed']
      );
      
      await pool.query('COMMIT');
      
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }
  
  // Check if matrix is complete
  async checkMatrixCompletion(userId, stage) {
    const config = this.getMatrixConfig(stage);
    
    const result = await pool.query(
      `SELECT COUNT(*) as filled_slots
       FROM matrix_positions
       WHERE parent_user_id = $1 AND stage = $2`,
      [userId, stage]
    );
    
    const filledSlots = parseInt(result.rows[0].filled_slots);
    const isComplete = filledSlots >= config.totalSlots;
    
    if (isComplete) {
      await this.markMatrixComplete(userId, stage);
    }
    
    return {
      filledSlots,
      totalSlots: config.totalSlots,
      isComplete
    };
  }
  
  // Mark matrix as complete
  async markMatrixComplete(userId, stage) {
    await pool.query(
      `UPDATE stage_matrix 
       SET is_complete = true, completed_at = NOW()
       WHERE user_id = $1 AND stage = $2`,
      [userId, stage]
    );
  }
}

module.exports = new MatrixService();
```

This is Part 1 of the technical guide. Should I continue with the remaining parts?
