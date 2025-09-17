const pool = require('../config/database');

const getStages = async (req, res) => {
  try {
    const stages = await pool.query('SELECT * FROM mlm_stages ORDER BY level ASC');
    
    // Get member count for each stage
    const stagesWithMembers = await Promise.all(
      stages.rows.map(async (stage) => {
        const memberCount = await pool.query(
          'SELECT COUNT(*) as count FROM users WHERE current_stage = $1 AND is_active = true',
          [stage.name.toLowerCase()]
        );
        return {
          ...stage,
          memberCount: parseInt(memberCount.rows[0].count)
        };
      })
    );

    res.json({ stages: stagesWithMembers });
  } catch (error) {
    console.error('Get stages error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const createStage = async (req, res) => {
  try {
    const { name, level, requirements, reward_amount, repurchase_required, repurchase_amount, description, color } = req.body;

    const result = await pool.query(
      'INSERT INTO mlm_stages (name, level, requirements, reward_amount, repurchase_required, repurchase_amount, description, color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, level, requirements, reward_amount, repurchase_required, repurchase_amount, description, color]
    );

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'create_stage', `Created MLM stage: ${name}`]
    );

    res.status(201).json({ stage: result.rows[0] });
  } catch (error) {
    console.error('Create stage error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, level, requirements, reward_amount, repurchase_required, repurchase_amount, description, color, is_active } = req.body;

    const result = await pool.query(
      'UPDATE mlm_stages SET name = $1, level = $2, requirements = $3, reward_amount = $4, repurchase_required = $5, repurchase_amount = $6, description = $7, color = $8, is_active = $9, updated_at = CURRENT_TIMESTAMP WHERE id = $10 RETURNING *',
      [name, level, requirements, reward_amount, repurchase_required, repurchase_amount, description, color, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'update_stage', `Updated MLM stage: ${name}`]
    );

    res.json({ stage: result.rows[0] });
  } catch (error) {
    console.error('Update stage error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getStageStats = async (req, res) => {
  try {
    const [totalMembers, activeStages, totalRewards, pendingPayouts] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users WHERE is_active = true'),
      pool.query('SELECT COUNT(*) as count FROM mlm_stages WHERE is_active = true'),
      pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = \'commission\' AND DATE_TRUNC(\'month\', created_at) = DATE_TRUNC(\'month\', CURRENT_DATE)'),
      pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM withdrawals WHERE status = \'pending\'')
    ]);

    res.json({
      totalMembers: parseInt(totalMembers.rows[0].count),
      activeStages: parseInt(activeStages.rows[0].count),
      totalRewardsPaid: parseFloat(totalRewards.rows[0].total),
      pendingPayouts: parseFloat(pendingPayouts.rows[0].total)
    });
  } catch (error) {
    console.error('Get stage stats error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { getStages, createStage, updateStage, getStageStats };