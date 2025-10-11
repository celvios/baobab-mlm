const pool = require('../config/database');

const MLM_LEVELS = {
  no_stage: { bonusUSD: 1.5, requiredReferrals: 2, matrixSize: '2x1' },
  feeder: { bonusUSD: 1.5, requiredReferrals: 6, matrixSize: '2x2' },
  bronze: { bonusUSD: 4.8, requiredReferrals: 14, matrixSize: '2x3' },
  silver: { bonusUSD: 30, requiredReferrals: 14, matrixSize: '2x3' },
  gold: { bonusUSD: 150, requiredReferrals: 14, matrixSize: '2x3' },
  diamond: { bonusUSD: 750, requiredReferrals: 14, matrixSize: '2x3' },
  infinity: { bonusUSD: 15000, requiredReferrals: 0, matrixSize: 'unlimited' }
};

class MLMService {
  async processReferral(referrerId, newUserId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if new user has paid
      const newUserResult = await client.query(
        'SELECT joining_fee_paid FROM users WHERE id = $1',
        [newUserId]
      );
      
      const hasPaid = newUserResult.rows[0]?.joining_fee_paid || false;
      
      // Check if user has approved deposit
      const depositCheck = await client.query(
        'SELECT id FROM deposit_requests WHERE user_id = $1 AND status = $2',
        [newUserId, 'approved']
      );
      
      const hasApprovedDeposit = depositCheck.rows.length > 0;

      // Only process if user has paid
      if (!hasPaid && !hasApprovedDeposit) {
        await client.query('COMMIT');
        return { success: false, message: 'User must pay joining fee first' };
      }

      // Get referrer's current level
      const referrerResult = await client.query(
        'SELECT mlm_level FROM users WHERE id = $1',
        [referrerId]
      );
      
      if (referrerResult.rows.length === 0) {
        throw new Error('Referrer not found');
      }

      const referrerLevel = referrerResult.rows[0].mlm_level || 'feeder';
      const levelConfig = MLM_LEVELS[referrerLevel] || MLM_LEVELS['feeder'];

      // Add referral earning
      await client.query(`
        INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount, status)
        VALUES ($1, $2, $3, $4, 'completed')
      `, [referrerId, newUserId, referrerLevel, levelConfig.bonusUSD]);

      // Update wallet
      await client.query(`
        UPDATE wallets SET balance = balance + $1, total_earned = total_earned + $1
        WHERE user_id = $2
      `, [levelConfig.bonusUSD, referrerId]);

      // Add transaction record
      await client.query(`
        INSERT INTO transactions (user_id, type, amount, description, status)
        VALUES ($1, 'referral_bonus', $2, $3, 'completed')
      `, [referrerId, levelConfig.bonusUSD, `Referral bonus for ${referrerLevel} stage`]);

      // Update stage matrix slots
      await client.query(`
        UPDATE stage_matrix 
        SET slots_filled = slots_filled + 1,
            is_complete = (slots_filled + 1 >= slots_required),
            completed_at = CASE WHEN (slots_filled + 1 >= slots_required) THEN CURRENT_TIMESTAMP ELSE completed_at END
        WHERE user_id = $1 AND stage = $2
      `, [referrerId, referrerLevel]);

      // Check for level progression
      await this.checkLevelProgression(client, referrerId);

      // Place user in matrix
      await this.placeInMatrix(client, newUserId, referrerId, referrerLevel);

      await client.query('COMMIT');
      return { success: true, message: 'Referral processed successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async checkLevelProgression(client, userId) {
    // Get current stage and check if matrix is complete
    const stageResult = await client.query(`
      SELECT u.mlm_level as current_stage, sm.is_complete, sm.slots_filled, sm.slots_required
      FROM users u
      LEFT JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = u.mlm_level
      WHERE u.id = $1
    `, [userId]);
    
    if (stageResult.rows.length === 0) return;
    
    const { current_stage, is_complete, slots_filled } = stageResult.rows[0];
    
    // Only progress if current stage matrix is complete
    if (!is_complete) return;
    
    const stageProgression = {
      'feeder': 'bronze',
      'bronze': 'silver',
      'silver': 'gold',
      'gold': 'diamond',
      'diamond': 'infinity'
    };
    
    const newStage = stageProgression[current_stage];
    
    if (newStage) {
      // Update user stage
      await client.query('UPDATE users SET mlm_level = $1 WHERE id = $2', [newStage, userId]);

      // Create new stage_matrix entry for next stage
      const nextStageSlots = newStage === 'infinity' ? 0 : (newStage === 'feeder' ? 6 : 14);
      await client.query(`
        INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
        VALUES ($1, $2, 0, $3)
        ON CONFLICT (user_id, stage) DO NOTHING
      `, [userId, newStage, nextStageSlots]);

      // Record progression
      await client.query(`
        INSERT INTO level_progressions (user_id, from_stage, to_stage, matrix_count)
        VALUES ($1, $2, $3, $4)
      `, [userId, current_stage, newStage, slots_filled]);

      // Send notification
      await client.query(`
        INSERT INTO market_updates (user_id, title, message, type)
        VALUES ($1, $2, $3, 'success')
      `, [userId, 'Stage Upgrade!', `Congratulations! You've been promoted to ${newStage.toUpperCase()} stage!`]);
    }
  }

  async placeInMatrix(client, userId, parentId, stage) {
    // Simple matrix placement - find next available position
    const matrixResult = await client.query(`
      SELECT * FROM mlm_matrix 
      WHERE stage = $1 AND (left_child_id IS NULL OR right_child_id IS NULL)
      ORDER BY created_at ASC
      LIMIT 1
    `, [stage]);

    let position = 1;
    let actualParentId = parentId;

    if (matrixResult.rows.length > 0) {
      const matrix = matrixResult.rows[0];
      if (!matrix.left_child_id) {
        await client.query(
          'UPDATE mlm_matrix SET left_child_id = $1 WHERE id = $2',
          [userId, matrix.id]
        );
        position = matrix.position * 2;
        actualParentId = matrix.user_id;
      } else if (!matrix.right_child_id) {
        await client.query(
          'UPDATE mlm_matrix SET right_child_id = $1 WHERE id = $2',
          [userId, matrix.id]
        );
        position = matrix.position * 2 + 1;
        actualParentId = matrix.user_id;
      }
    }

    // Create matrix entry for new user
    await client.query(`
      INSERT INTO mlm_matrix (user_id, stage, position, parent_id)
      VALUES ($1, $2, $3, $4)
    `, [userId, stage, position, actualParentId]);
  }

  async getUserMatrix(userId) {
    const result = await pool.query(`
      SELECT m.*, 
             u.full_name, u.email, u.referral_code,
             lc.full_name as left_child_name, lc.email as left_child_email,
             rc.full_name as right_child_name, rc.email as right_child_email
      FROM mlm_matrix m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN users lc ON m.left_child_id = lc.id
      LEFT JOIN users rc ON m.right_child_id = rc.id
      WHERE m.user_id = $1
      ORDER BY m.stage, m.position
    `, [userId]);

    return result.rows;
  }

  async getUserEarnings(userId) {
    const result = await pool.query(`
      SELECT 
        stage,
        COUNT(*) as referrals_count,
        SUM(amount) as total_earned
      FROM referral_earnings 
      WHERE user_id = $1 AND status = 'completed'
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
      SELECT u.id, u.full_name, u.email, u.mlm_level, u.is_active, u.created_at,
             re.amount as earning_from_user,
             CASE 
               WHEN EXISTS (SELECT 1 FROM deposit_requests WHERE user_id = u.id AND status = 'approved') 
               THEN true 
               ELSE false 
             END as has_deposited
      FROM users u
      LEFT JOIN referral_earnings re ON u.id = re.referred_user_id AND re.user_id = $1
      WHERE u.referred_by = (SELECT referral_code FROM users WHERE id = $1)
      ORDER BY u.created_at DESC
    `, [userId]);

    return result.rows;
  }

  async getStageProgress(userId) {
    const result = await pool.query(`
      SELECT u.mlm_level as current_stage,
             sm.slots_filled,
             sm.slots_required,
             sm.is_complete
      FROM users u
      LEFT JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = u.mlm_level
      WHERE u.id = $1
    `, [userId]);

    return result.rows[0] || null;
  }

  async getBinaryTree(userId) {
    const result = await pool.query(`
      SELECT m.*,
             u.full_name, u.email, u.mlm_level,
             lc.full_name as left_name, lc.mlm_level as left_level,
             rc.full_name as right_name, rc.mlm_level as right_level
      FROM mlm_matrix m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN users lc ON m.left_child_id = lc.id
      LEFT JOIN users rc ON m.right_child_id = rc.id
      WHERE m.user_id = $1
    `, [userId]);

    return result.rows[0] || null;
  }
}

module.exports = new MLMService();