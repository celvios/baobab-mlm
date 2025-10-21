const pool = require('../config/database');

const fixStuckStages = async (req, res) => {
  const client = await pool.connect();
  
  try {
    // First, get diagnostic info
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

module.exports = { fixStuckStages, manualUpgradeUser };
