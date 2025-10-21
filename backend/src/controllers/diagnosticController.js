const pool = require('../config/database');

const diagnoseBronze = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const bronzeUsers = await client.query(`
      SELECT u.id, u.full_name, u.email, u.mlm_level, w.total_earned, w.balance
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE u.mlm_level = 'bronze'
      LIMIT 5
    `);
    
    const results = [];
    
    for (const user of bronzeUsers.rows) {
      const earnings = await client.query(`
        SELECT stage, amount, status FROM referral_earnings WHERE user_id = $1
      `, [user.id]);
      
      const byStage = {};
      for (const e of earnings.rows) {
        if (!byStage[e.stage]) byStage[e.stage] = { count: 0, total: 0, status: e.status };
        byStage[e.stage].count++;
        byStage[e.stage].total += parseFloat(e.amount);
      }
      
      const qualified = await client.query(`
        SELECT COUNT(*) as count FROM stage_matrix_members
        WHERE matrix_owner_id = $1 AND matrix_stage = 'bronze' AND is_qualified = true
      `, [user.id]);
      
      const matrix = await client.query(`
        SELECT slots_filled, qualified_slots_filled, slots_required
        FROM stage_matrix WHERE user_id = $1 AND stage = 'bronze'
      `, [user.id]);
      
      results.push({
        user: {
          name: user.full_name,
          email: user.email,
          stage: user.mlm_level
        },
        wallet: {
          totalEarned: parseFloat(user.total_earned || 0),
          inNaira: parseFloat(user.total_earned || 0) * 1500
        },
        earnings: byStage,
        qualified: parseInt(qualified.rows[0].count),
        expected: parseInt(qualified.rows[0].count) * 4.8,
        expectedNaira: parseInt(qualified.rows[0].count) * 4.8 * 1500,
        matrix: matrix.rows[0] || null
      });
    }
    
    res.json({ results });
    
  } catch (error) {
    console.error('Diagnostic error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

module.exports = { diagnoseBronze };
