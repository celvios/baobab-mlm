const pool = require('../config/database');

const fixStuckStages = async (req, res) => {
  const client = await pool.connect();
  
  try {
    // First, create missing stage_matrix entries for all users at no_stage
    await client.query(`
      INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required, qualified_slots_filled)
      SELECT u.id, 'no_stage', 0, 6, 0
      FROM users u
      WHERE u.mlm_level = 'no_stage' 
        AND NOT EXISTS (SELECT 1 FROM stage_matrix sm WHERE sm.user_id = u.id AND sm.stage = 'no_stage')
        AND (u.role != 'admin' OR u.role IS NULL)
    `);
    
    // Get diagnostic info
    const diagnostic = await client.query(`
      SELECT u.id, u.email, u.mlm_level, u.referral_code,
             sm.qualified_slots_filled, sm.slots_filled, sm.slots_required, sm.is_complete,
             (SELECT COUNT(*) FROM users WHERE referred_by = u.referral_code) as direct_referrals
      FROM users u
      LEFT JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = u.mlm_level
      WHERE u.role != 'admin' OR u.role IS NULL
      ORDER BY u.created_at DESC
    `);
    
    // Find users who should be upgraded
    const stuckUsers = await client.query(`
      SELECT u.id, u.email, u.mlm_level, sm.qualified_slots_filled, sm.slots_required
      FROM users u
      JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = u.mlm_level
      WHERE sm.qualified_slots_filled >= sm.slots_required 
        AND sm.is_complete = false
    `);
    
    const results = [];
    
    for (const user of stuckUsers.rows) {
      await client.query('BEGIN');
      
      try {
        const mlmService = require('../services/mlmService');
        await mlmService.checkLevelProgression(client, user.id);
        await client.query('COMMIT');
        results.push({ email: user.email, status: 'upgraded' });
      } catch (error) {
        await client.query('ROLLBACK');
        results.push({ email: user.email, status: 'failed', error: error.message });
      }
    }
    
    res.json({ 
      message: `Fixed ${results.filter(r => r.status === 'upgraded').length} users`,
      results,
      diagnostic: diagnostic.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

const manualUpgradeUser = async (req, res) => {
  const { email } = req.params;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const userResult = await client.query('SELECT id, mlm_level FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    const mlmService = require('../services/mlmService');
    await mlmService.checkLevelProgression(client, user.id);
    
    await client.query('COMMIT');
    res.json({ message: 'User upgraded successfully', email });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

const recalculateQualifiedSlots = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get all users with stage_matrix at no_stage
    const users = await client.query(`
      SELECT u.id, u.referral_code, sm.id as matrix_id
      FROM users u
      JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = 'no_stage'
      WHERE u.role != 'admin' OR u.role IS NULL
    `);
    
    const results = [];
    
    for (const user of users.rows) {
      // Count approved referrals
      const count = await client.query(`
        SELECT COUNT(*) as count
        FROM users u2
        WHERE u2.referred_by = $1
          AND EXISTS (SELECT 1 FROM deposit_requests WHERE user_id = u2.id AND status = 'approved')
      `, [user.referral_code]);
      
      const approvedCount = parseInt(count.rows[0].count);
      
      // Update qualified_slots_filled
      await client.query(`
        UPDATE stage_matrix 
        SET qualified_slots_filled = $1, slots_filled = $1
        WHERE id = $2
      `, [approvedCount, user.matrix_id]);
      
      results.push({ id: user.id, approvedReferrals: approvedCount });
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Recalculated qualified slots', results });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

module.exports = { fixStuckStages, manualUpgradeUser, recalculateQualifiedSlots };
