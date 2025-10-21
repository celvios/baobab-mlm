const pool = require('../config/database');

const fixStuckStages = async (req, res) => {
  const client = await pool.connect();
  
  try {
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
      results 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

module.exports = { fixStuckStages };
