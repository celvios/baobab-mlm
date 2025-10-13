const pool = require('../config/database');

const autoUpgradeStages = async (req, res) => {
  try {
    const client = await pool.connect();
    let upgraded = 0;

    // Feeder to Bronze (6+ paid referrals)
    const feederUsers = await client.query(`
      SELECT u.id, u.email, u.full_name, sm.slots_filled
      FROM users u
      JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = 'feeder'
      WHERE u.mlm_level = 'feeder' AND sm.slots_filled >= 6
    `);

    for (const user of feederUsers.rows) {
      await client.query("UPDATE users SET mlm_level = 'bronze' WHERE id = $1", [user.id]);
      await client.query(`
        INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
        VALUES ($1, 'bronze', 0, 14)
        ON CONFLICT (user_id, stage) DO NOTHING
      `, [user.id]);
      upgraded++;
    }

    // Bronze to Silver (14+ paid referrals)
    const bronzeUsers = await client.query(`
      SELECT u.id FROM users u
      JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = 'bronze'
      WHERE u.mlm_level = 'bronze' AND sm.slots_filled >= 14
    `);

    for (const user of bronzeUsers.rows) {
      await client.query("UPDATE users SET mlm_level = 'silver' WHERE id = $1", [user.id]);
      await client.query(`
        INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
        VALUES ($1, 'silver', 0, 14)
        ON CONFLICT (user_id, stage) DO NOTHING
      `, [user.id]);
      upgraded++;
    }

    // Silver to Gold
    const silverUsers = await client.query(`
      SELECT u.id FROM users u
      JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = 'silver'
      WHERE u.mlm_level = 'silver' AND sm.slots_filled >= 14
    `);

    for (const user of silverUsers.rows) {
      await client.query("UPDATE users SET mlm_level = 'gold' WHERE id = $1", [user.id]);
      await client.query(`
        INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
        VALUES ($1, 'gold', 0, 14)
        ON CONFLICT (user_id, stage) DO NOTHING
      `, [user.id]);
      upgraded++;
    }

    // Gold to Diamond
    const goldUsers = await client.query(`
      SELECT u.id FROM users u
      JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = 'gold'
      WHERE u.mlm_level = 'gold' AND sm.slots_filled >= 14
    `);

    for (const user of goldUsers.rows) {
      await client.query("UPDATE users SET mlm_level = 'diamond' WHERE id = $1", [user.id]);
      await client.query(`
        INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
        VALUES ($1, 'diamond', 0, 14)
        ON CONFLICT (user_id, stage) DO NOTHING
      `, [user.id]);
      upgraded++;
    }

    // Diamond to Infinity
    const diamondUsers = await client.query(`
      SELECT u.id FROM users u
      JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = 'diamond'
      WHERE u.mlm_level = 'diamond' AND sm.slots_filled >= 14
    `);

    for (const user of diamondUsers.rows) {
      await client.query("UPDATE users SET mlm_level = 'infinity' WHERE id = $1", [user.id]);
      await client.query(`
        INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
        VALUES ($1, 'infinity', 0, 0)
        ON CONFLICT (user_id, stage) DO NOTHING
      `, [user.id]);
      upgraded++;
    }

    client.release();
    res.json({ success: true, upgraded, message: `${upgraded} users upgraded` });
  } catch (error) {
    console.error('Auto upgrade error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { autoUpgradeStages };
