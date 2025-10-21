const pool = require('../config/database');

const fixBronzeEarnings = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get Bronze users
    const bronzeUsers = await client.query(`
      SELECT u.id, u.full_name, u.email FROM users u WHERE u.mlm_level = 'bronze'
    `);
    
    const results = [];
    
    for (const user of bronzeUsers.rows) {
      // Create Bronze matrix if missing
      await client.query(`
        INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required, qualified_slots_filled)
        VALUES ($1, 'bronze', 0, 14, 0)
        ON CONFLICT (user_id, stage) DO NOTHING
      `, [user.id]);
      
      // Get all Feeder earnings that should be Bronze
      const feederEarnings = await client.query(`
        SELECT id FROM referral_earnings 
        WHERE user_id = $1 AND stage = 'feeder'
      `, [user.id]);
      
      // Update to Bronze rate
      for (const earning of feederEarnings.rows) {
        await client.query(`
          UPDATE referral_earnings 
          SET stage = 'bronze', amount = 4.8 
          WHERE id = $1
        `, [earning.id]);
      }
      
      // Recalculate wallet
      const newTotal = await client.query(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM referral_earnings 
        WHERE user_id = $1 AND status = 'completed'
      `, [user.id]);
      
      await client.query(`
        UPDATE wallets SET total_earned = $1 WHERE user_id = $2
      `, [newTotal.rows[0].total, user.id]);
      
      results.push({
        user: user.full_name,
        fixed: feederEarnings.rows.length,
        newTotal: parseFloat(newTotal.rows[0].total),
        newTotalNaira: parseFloat(newTotal.rows[0].total) * 1500
      });
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Fixed', results });
    
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

module.exports = { fixBronzeEarnings };
