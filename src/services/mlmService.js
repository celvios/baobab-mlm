const pool = require('../config/database');

const STAGES = {
  feeder: { bonus: 1.5, slots: 6, matrixSize: '2x2', next: 'bronze' },
  bronze: { bonus: 4.8, slots: 14, matrixSize: '2x3', next: 'silver' },
  silver: { bonus: 30, slots: 14, matrixSize: '2x3', next: 'gold' },
  gold: { bonus: 150, slots: 14, matrixSize: '2x3', next: 'diamond' },
  diamond: { bonus: 750, slots: 14, matrixSize: '2x3', next: 'infinity' },
  infinity: { bonus: 15000, slots: 0, matrixSize: 'unlimited', next: null }
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
      `, [userId]);
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async placeUserInMatrix(newUserId, sponsorId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Find placement position (spillover logic)
      let placementUser = await this.findPlacementPosition(client, sponsorId);
      
      // Get placement user's current stage
      const stageResult = await client.query(
        'SELECT mlm_level FROM users WHERE id = $1',
        [placementUser]
      );
      const currentStage = stageResult.rows[0].mlm_level;
      const stageConfig = STAGES[currentStage];
      
      // Add to matrix
      await client.query(`
        INSERT INTO mlm_matrix (user_id, stage, parent_id, position)
        VALUES ($1, $2, $3, 1)
      `, [newUserId, currentStage, placementUser]);
      
      // Pay upline members in the matrix
      await this.payUpline(client, newUserId, placementUser, currentStage);
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  async findPlacementPosition(client, sponsorId) {
    // Simple spillover: find first user with incomplete matrix
    const result = await client.query(`
      SELECT u.id FROM users u
      INNER JOIN stage_matrix sm ON u.id = sm.user_id
      WHERE sm.is_complete = false
      AND u.id >= $1
      ORDER BY u.id ASC
      LIMIT 1
    `, [sponsorId]);
    
    return result.rows.length > 0 ? result.rows[0].id : sponsorId;
  }
  
  async payUpline(client, newUserId, placementUserId, stage) {
    const stageConfig = STAGES[stage];
    
    // Update stage matrix
    await client.query(`
      UPDATE stage_matrix 
      SET slots_filled = slots_filled + 1
      WHERE user_id = $1 AND stage = $2
    `, [placementUserId, stage]);
    
    // Check if matrix is complete
    const matrixCheck = await client.query(`
      SELECT slots_filled, slots_required FROM stage_matrix
      WHERE user_id = $1 AND stage = $2
    `, [placementUserId, stage]);
    
    const { slots_filled, slots_required } = matrixCheck.rows[0];
    
    // Record earning
    await client.query(`
      INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount)
      VALUES ($1, $2, $3, $4)
    `, [placementUserId, newUserId, stage, stageConfig.bonus]);
    
    // Update wallet
    await client.query(`
      UPDATE wallets 
      SET balance = balance + $1, total_earned = total_earned + $1
      WHERE user_id = $2
    `, [stageConfig.bonus, placementUserId]);
    
    // Add transaction
    await client.query(`
      INSERT INTO transactions (user_id, type, amount, description, status)
      VALUES ($1, 'matrix_bonus', $2, $3, 'completed')
    `, [placementUserId, stageConfig.bonus, `${stage.toUpperCase()} stage bonus`]);
    
    // Check for stage completion and progression
    if (slots_filled >= slots_required) {
      await this.completeStage(client, placementUserId, stage);
    }
  }
  
  async completeStage(client, userId, currentStage) {
    const stageConfig = STAGES[currentStage];
    
    // Mark stage as complete
    await client.query(`
      UPDATE stage_matrix 
      SET is_complete = true, completed_at = NOW()
      WHERE user_id = $1 AND stage = $2
    `, [userId, currentStage]);
    
    // Progress to next stage
    if (stageConfig.next) {
      const nextStage = stageConfig.next;
      const nextConfig = STAGES[nextStage];
      
      // Update user level
      await client.query(
        'UPDATE users SET mlm_level = $1 WHERE id = $2',
        [nextStage, userId]
      );
      
      // Initialize next stage matrix
      await client.query(`
        INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
        VALUES ($1, $2, 0, $3)
        ON CONFLICT (user_id, stage) DO NOTHING
      `, [userId, nextStage, nextConfig.slots]);
      
      // Record progression
      await client.query(`
        INSERT INTO level_progressions (user_id, from_stage, to_stage, matrix_count)
        VALUES ($1, $2, $3, $4)
      `, [userId, currentStage, nextStage, stageConfig.slots]);
      
      // Send notification
      await client.query(`
        INSERT INTO market_updates (user_id, title, message, type)
        VALUES ($1, 'Stage Complete!', $2, 'success')
      `, [userId, `Congratulations! You've completed ${currentStage.toUpperCase()} and advanced to ${nextStage.toUpperCase()}!`]);
    }
  }

  async getStageProgress(userId) {
    const result = await pool.query(`
      SELECT u.mlm_level, sm.slots_filled, sm.slots_required, sm.is_complete
      FROM users u
      LEFT JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = u.mlm_level
      WHERE u.id = $1
    `, [userId]);
    
    if (result.rows.length === 0) return null;
    
    const { mlm_level, slots_filled, slots_required } = result.rows[0];
    const stageConfig = STAGES[mlm_level];
    
    return {
      currentStage: mlm_level,
      nextStage: stageConfig.next,
      slotsFilled: slots_filled || 0,
      slotsRequired: slots_required || stageConfig.slots,
      progress: slots_required ? Math.round((slots_filled / slots_required) * 100) : 0,
      bonusPerPerson: stageConfig.bonus
    };
  }

  async getUserMatrix(userId) {
    const result = await pool.query(`
      SELECT m.stage, m.position, m.created_at,
             u.full_name, u.email, u.mlm_level
      FROM mlm_matrix m
      JOIN users u ON m.user_id = u.id
      WHERE m.parent_id = $1
      ORDER BY m.created_at ASC
    `, [userId]);

    return result.rows;
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
      SELECT u.id, u.full_name, u.email, u.mlm_level, u.created_at,
             re.amount as earning_from_user
      FROM users u
      LEFT JOIN referral_earnings re ON u.id = re.referred_user_id AND re.user_id = $1
      WHERE u.referred_by = (SELECT referral_code FROM users WHERE id = $1)
      ORDER BY u.created_at DESC
    `, [userId]);

    return result.rows;
  }
}

module.exports = new MLMService();