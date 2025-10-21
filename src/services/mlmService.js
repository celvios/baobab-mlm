const pool = require('../config/database');

const STAGES = {
  feeder: { bonus: 1.5, slots: 6, levels: 2, next: 'bronze' },
  bronze: { bonus: 4.8, slots: 14, levels: 3, next: 'silver' },
  silver: { bonus: 30, slots: 14, levels: 3, next: 'gold' },
  gold: { bonus: 150, slots: 14, levels: 3, next: 'diamond' },
  diamond: { bonus: 750, slots: 14, levels: 3, next: 'infinity' },
  infinity: { bonus: 15000, slots: 0, levels: 0, next: null }
};

class MLMService {
  async initializeUser(userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Initialize stage matrix for feeder
      await client.query(`
        INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
        VALUES ($1, 'feeder', 0, 6)
        ON CONFLICT (user_id, stage) DO NOTHING
      `, [userId]);       position: matrixInfo.rows.length > 0 ? matrixInfo.rows[0].position : 'root'
    };
    
    if (matrixInfo.rows.length > 0) {
      const { left_child_id, right_child_id } = matrixInfo.rows[0];
      
      if (left_child_id) {
        node.left = await this.buildTreeNode(left_child_id, stage);
      }
      
      if (right_child_id) {
        node.right = await this.buildTreeNode(right_child_id, stage);
      }
    }
    
    return node;
  }

  async getUserEarnings(userId) {
    const result = await pool.query(`
      SELECT 
        stage,
        COUNT(*) as people_count,
        SUM(amount) as total_earned
      FROM referral_earnings 
      WHERE user_id = $1
      GROUP BY stage
      ORDER BY 
        CASE stage
          WHEN 'feeder' THEN 1
          WHEN 'bronze' THEN 2
          WHEN 'silver' THEN 3
          WHEN 'gold' THEN 4
          WHEN 'diamond' THEN 5
          WHEN 'infinity' THEN 6
        END
    `, [userId]);

    return result.rows;
  }

  async getTeamMembers(userId) {
    const result = await pool.query(`
      WITH RECURSIVE downline AS (
        -- Direct referrals
        SELECT u.id, u.full_name, u.email, u.mlm_level, u.created_at, u.referred_by,
               1 as level
        FROM users u
        WHERE u.referred_by = (SELECT referral_code FROM users WHERE id = $1)
        
        UNION ALL
        
        -- Indirect referrals (recursive)
        SELECT u.id, u.full_name, u.email, u.mlm_level, u.created_at, u.referred_by,
               d.level + 1
        FROM users u
        INNER JOIN downline d ON u.referred_by = (SELECT referral_code FROM users WHERE id = d.id)
      )
      SELECT d.id, d.full_name, d.email, d.mlm_level, d.created_at, d.level,
             re.amount as earning_from_user,
             CASE WHEN re.id IS NOT NULL THEN true ELSE false END as has_deposited
      FROM downline d
      LEFT JOIN referral_earnings re ON d.id = re.referred_user_id AND re.user_id = $1
      ORDER BY d.level, d.created_at DESC
    `, [userId]);

    return result.rows;
  }

  async completeUserMatrix(userId, currentStage) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const stageConfig = STAGES[currentStage];
      if (!stageConfig) {
        throw new Error('Invalid stage');
      }

      const matrixResult = await client.query(
        'SELECT slots_filled, slots_required FROM stage_matrix WHERE user_id = $1 AND stage = $2',
        [userId, currentStage]
      );

      let slotsNeeded = stageConfig.slots;
      if (matrixResult.rows.length > 0) {
        slotsNeeded = stageConfig.slots - matrixResult.rows[0].slots_filled;
      }

      const userResult = await client.query(
        'SELECT referral_code FROM users WHERE id = $1',
        [userId]
      );
      const referralCode = userResult.rows[0].referral_code;

      const generatedUsers = [];
      const earnings = [];

      for (let i = 0; i < slotsNeeded; i++) {
        const newUser = await client.query(`
          INSERT INTO users (full_name, email, password, phone, referral_code, referred_by, mlm_level, joining_fee_paid, joining_fee_amount, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, 'feeder', true, 18000, true)
          RETURNING id, full_name, email, referral_code
        `, [
          `Generated User ${Date.now()}-${i}`,
          `generated_${Date.now()}_${i}@test.com`,
          '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          `+234${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
          `GEN${Date.now()}${i}`,
          referralCode
        ]);

        generatedUsers.push(newUser.rows[0]);

        await client.query(`
          INSERT INTO wallets (user_id, balance, total_earned)
          VALUES ($1, 0, 0)
        `, [newUser.rows[0].id]);

        await client.query(`
          INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
          VALUES ($1, 'feeder', 0, 6)
        `, [newUser.rows[0].id]);

        const earning = await client.query(`
          INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount, status)
          VALUES ($1, $2, $3, $4, 'completed')
          RETURNING id, amount
        `, [userId, newUser.rows[0].id, currentStage, stageConfig.bonus]);

        earnings.push(earning.rows[0]);

        await client.query(`
          UPDATE wallets SET balance = balance + $1, total_earned = total_earned + $1
          WHERE user_id = $2
        `, [stageConfig.bonus, userId]);

        await client.query(`
          INSERT INTO transactions (user_id, type, amount, description, status)
          VALUES ($1, 'referral_bonus', $2, $3, 'completed')
        `, [userId, stageConfig.bonus, `Referral bonus from ${newUser.rows[0].full_name} at ${currentStage} stage`]);
      }

      await client.query(`
        UPDATE stage_matrix 
        SET slots_filled = slots_required, is_complete = true, completed_at = NOW()
        WHERE user_id = $1 AND stage = $2
      `, [userId, currentStage]);

      if (stageConfig.next) {
        await client.query(`
          UPDATE users SET mlm_level = $1 WHERE id = $2
        `, [stageConfig.next, userId]);

        await client.query(`
          INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
          VALUES ($1, $2, 0, $3)
          ON CONFLICT (user_id, stage) DO NOTHING
        `, [userId, stageConfig.next, STAGES[stageConfig.next].slots]);

        await client.query(`
          INSERT INTO level_progressions (user_id, from_stage, to_stage, matrix_count)
          VALUES ($1, $2, $3, 1)
        `, [userId, currentStage, stageConfig.next]);
      }

      await client.query('COMMIT');

      return {
        generatedUsers: generatedUsers.length,
        totalEarnings: earnings.reduce((sum, e) => sum + parseFloat(e.amount), 0),
        completedStage: currentStage,
        newStage: stageConfig.next || 'infinity',
        users: generatedUsers,
        earnings
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
}

module.exports = new MLMService();