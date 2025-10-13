const mlmService = require('../services/mlmService');
const pool = require('../config/database');

const getMatrix = async (req, res) => {
  try {
    const userId = req.user.id;
    const matrix = await mlmService.getUserMatrix(userId);
    res.json({ matrix });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getBinaryTree = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user info
    const userResult = await pool.query(
      'SELECT id, full_name, email, mlm_level FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Get team members
    const team = await mlmService.getTeamMembers(userId);
    
    // Build tree structure - add team members as left/right children for visualization
    const tree = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      mlm_level: user.mlm_level || 'feeder',
      is_active: true
    };
    
    // Add team members as children
    if (team.length > 0) {
      tree.left = team[0];
      if (team.length > 1) {
        tree.right = team[1];
      }
    }
    
    res.json({ tree });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEarnings = async (req, res) => {
  try {
    const userId = req.user.id;
    const earnings = await mlmService.getUserEarnings(userId);
    res.json({ earnings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const team = await mlmService.getTeamMembers(userId);
    res.json({ team });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLevelProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await mlmService.getStageProgress(userId);
    
    if (!progress) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFullTree = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userResult = await pool.query(
      'SELECT id, full_name, email, mlm_level, referral_code, referred_by FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    let referrer = null;
    
    if (user.referred_by) {
      const referrerResult = await pool.query(
        'SELECT id, full_name, email, mlm_level, referral_code FROM users WHERE referral_code = $1',
        [user.referred_by]
      );
      
      if (referrerResult.rows.length > 0) {
        referrer = referrerResult.rows[0];
      }
    }
    
    const team = await mlmService.getTeamMembers(userId);
    
    res.json({ 
      user: {
        ...user,
        team
      },
      referrer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const completeMatrix = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const userResult = await pool.query(
      'SELECT id, full_name, email, mlm_level, referral_code FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    
    // Ensure user has proper mlm_level
    let userStage = user.mlm_level;
    if (!userStage || userStage === 'no_stage' || userStage === '') {
      await pool.query('UPDATE users SET mlm_level = $1 WHERE id = $2', ['feeder', user.id]);
      userStage = 'feeder';
    }
    
    const result = await mlmService.completeUserMatrix(user.id, userStage);
    
    res.json({
      message: 'Matrix completion process executed',
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        currentStage: user.mlm_level
      },
      result
    });
  } catch (error) {
    console.error('Complete matrix error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMatrixTree = async (req, res) => {
  try {
    const userId = req.user.id;
    const tree = await mlmService.getFullMatrixTree(userId);
    res.json({ tree });
  } catch (error) {
    console.error('Get matrix tree error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const syncUserMatrix = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's referral code
    const userResult = await pool.query(
      'SELECT referral_code, mlm_level FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { referral_code, mlm_level } = userResult.rows[0];
    const stage = mlm_level || 'feeder';
    
    // Count paid referrals
    const paidReferrals = await pool.query(`
      SELECT COUNT(*) as count
      FROM users u
      WHERE u.referred_by = $1
      AND EXISTS (
        SELECT 1 FROM deposit_requests dr 
        WHERE dr.user_id = u.id AND dr.status = 'approved'
      )
    `, [referral_code]);
    
    const paidCount = parseInt(paidReferrals.rows[0].count);
    
    // Update stage_matrix
    await pool.query(`
      INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
      VALUES ($1, $2, $3, 6)
      ON CONFLICT (user_id, stage) 
      DO UPDATE SET slots_filled = $3, is_complete = ($3 >= stage_matrix.slots_required)
    `, [userId, stage, paidCount]);
    
    res.json({ 
      message: 'Matrix synced successfully',
      stage,
      slots_filled: paidCount,
      slots_required: 6
    });
  } catch (error) {
    console.error('Sync matrix error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const generateReferrals = async (req, res) => {
  try {
    const { email } = req.params;
    
    const userResult = await pool.query(
      'SELECT id, referral_code, mlm_level FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const directReferrals = [];
      
      // Generate 2 direct referrals
      for (let i = 0; i < 2; i++) {
        const newUser = await client.query(`
          INSERT INTO users (full_name, email, password, phone, referral_code, referred_by, mlm_level, is_active, is_email_verified, joining_fee_paid)
          VALUES ($1, $2, $3, $4, $5, $6, 'feeder', true, true, true)
          RETURNING id, referral_code
        `, [
          `Direct Referral ${i + 1}`,
          `direct_${Date.now()}_${i}@test.com`,
          '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          `+234${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
          `DIR${Date.now()}${i}`,
          user.referral_code
        ]);

        const userId = newUser.rows[0].id;
        directReferrals.push(newUser.rows[0]);

        await client.query('INSERT INTO deposit_requests (user_id, amount, status) VALUES ($1, 18000, $2)', [userId, 'approved']);
        await client.query('INSERT INTO wallets (user_id, balance, total_earned) VALUES ($1, 0, 0)', [userId]);
        await client.query('INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required) VALUES ($1, $2, 0, 6)', [userId, 'feeder']);
      }

      // Generate 4 spillover referrals (2 for each direct referral)
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          const spillover = await client.query(`
            INSERT INTO users (full_name, email, password, phone, referral_code, referred_by, mlm_level, is_active, is_email_verified, joining_fee_paid)
            VALUES ($1, $2, $3, $4, $5, $6, 'feeder', true, true, true)
            RETURNING id
          `, [
            `Spillover ${i + 1}-${j + 1}`,
            `spillover_${Date.now()}_${i}_${j}@test.com`,
            '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            `+234${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
            `SPILL${Date.now()}${i}${j}`,
            directReferrals[i].referral_code
          ]);

          const userId = spillover.rows[0].id;
          await client.query('INSERT INTO deposit_requests (user_id, amount, status) VALUES ($1, 18000, $2)', [userId, 'approved']);
          await client.query('INSERT INTO wallets (user_id, balance, total_earned) VALUES ($1, 0, 0)', [userId]);
          await client.query('INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required) VALUES ($1, $2, 0, 6)', [userId, 'feeder']);
        }
      }

      await client.query('COMMIT');
      res.json({ message: '6 referrals generated successfully', directReferrals: 2, spilloverReferrals: 4 });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Generate referrals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMatrix, getEarnings, getTeam, getLevelProgress, getFullTree, getBinaryTree, completeMatrix, getMatrixTree, syncUserMatrix, generateReferrals };