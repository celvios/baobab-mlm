const pool = require('../config/database');

const autoUpgradeStages = async (req, res) => {
  try {
    const client = await pool.connect();
    let upgraded = 0;

    // Feeder to Bronze (6+ paid referrals from deposit_requests)
    const feederUsers = await client.query(`
      SELECT u.id, u.email, u.referral_code,
             (SELECT COUNT(*) FROM users u2 
              WHERE u2.referred_by = u.referral_code 
              AND EXISTS (SELECT 1 FROM deposit_requests dr WHERE dr.user_id = u2.id AND dr.status = 'approved')
             ) as paid_count
      FROM users u
      WHERE u.mlm_level = 'feeder'
      HAVING paid_count >= 6
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
      SELECT u.id, COUNT(re.id) as paid_count
      FROM users u
      LEFT JOIN referral_earnings re ON u.id = re.user_id AND re.stage = 'bronze' AND re.status = 'completed'
      WHERE u.mlm_level = 'bronze'
      GROUP BY u.id
      HAVING COUNT(re.id) >= 14
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
      SELECT u.id, COUNT(re.id) as paid_count
      FROM users u
      LEFT JOIN referral_earnings re ON u.id = re.user_id AND re.stage = 'silver' AND re.status = 'completed'
      WHERE u.mlm_level = 'silver'
      GROUP BY u.id
      HAVING COUNT(re.id) >= 14
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
      SELECT u.id, COUNT(re.id) as paid_count
      FROM users u
      LEFT JOIN referral_earnings re ON u.id = re.user_id AND re.stage = 'gold' AND re.status = 'completed'
      WHERE u.mlm_level = 'gold'
      GROUP BY u.id
      HAVING COUNT(re.id) >= 14
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
      SELECT u.id, COUNT(re.id) as paid_count
      FROM users u
      LEFT JOIN referral_earnings re ON u.id = re.user_id AND re.stage = 'diamond' AND re.status = 'completed'
      WHERE u.mlm_level = 'diamond'
      GROUP BY u.id
      HAVING COUNT(re.id) >= 14
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
