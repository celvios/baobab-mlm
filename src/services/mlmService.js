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
      
      // Find placement position in binary tree
      const placement = await this.findBinaryPlacement(client, sponsorId);
      
      // Get placement user's current stage
      const stageResult = await client.query(
        'SELECT mlm_level FROM users WHERE id = $1',
        [placement.parentId]
      );
      const currentStage = stageResult.rows[0].mlm_level;
      
      // Add to matrix with proper position (left or right)
      await client.query(`
        INSERT INTO mlm_matrix (user_id, stage, parent_id, position, level)
        VALUES ($1, $2, $3, $4, $5)
      `, [newUserId, currentStage, placement.parentId, placement.position, placement.level]);
      
      // Update parent's left or right child
      if (placement.position === 'left') {
        await client.query(
          'UPDATE mlm_matrix SET left_child_id = $1 WHERE user_id = $2 AND stage = $3',
          [newUserId, placement.parentId, currentStage]
        );
      } else {
        await client.query(
          'UPDATE mlm_matrix SET right_child_id = $1 WHERE user_id = $2 AND stage = $3',
          [newUserId, placement.parentId, currentStage]
        );
      }
      
      // Pay all upline members in the matrix
      await this.payUplineChain(client, newUserId, placement.parentId, currentStage);
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  async findBinaryPlacement(client, sponsorId) {
    // Get sponsor's current stage
    const sponsorStage = await client.query(
      'SELECT mlm_level FROM users WHERE id = $1',
      [sponsorId]
    );
    const stage = sponsorStage.rows[0].mlm_level;
    
    // Breadth-first search for first available position
    const queue = [{ userId: sponsorId, level: 1 }];
    
    while (queue.length > 0) {
      const { userId, level } = queue.shift();
      
      // Get this user's matrix entry
      const matrixEntry = await client.query(`
        SELECT left_child_id, right_child_id, level
        FROM mlm_matrix
        WHERE user_id = $1 AND stage = $2
      `, [userId, stage]);
      
      if (matrixEntry.rows.length === 0) {
        // User doesn't have matrix entry yet, they can be a parent
        return { parentId: userId, position: 'left', level: 1 };
      }
      
      const { left_child_id, right_child_id } = matrixEntry.rows[0];
      
      // Check left position
      if (!left_child_id) {
        return { parentId: userId, position: 'left', level: level };
      }
      
      // Check right position
      if (!right_child_id) {
        return { parentId: userId, position: 'right', level: level };
      }
      
      // Both positions filled, add children to queue
      queue.push({ userId: left_child_id, level: level + 1 });
      queue.push({ userId: right_child_id, level: level + 1 });
    }
    
    // Fallback
    return { parentId: sponsorId, position: 'left', level: 1 };
  }
  
  async payUplineChain(client, newUserId, parentId, stage) {
    const stageConfig = STAGES[stage];
    
    // Find the root of this matrix (the person who earns from this placement)
    let currentId = parentId;
    let rootId = null;
    
    // Traverse up to find the matrix owner
    while (currentId) {
      const parent = await client.query(`
        SELECT parent_id FROM mlm_matrix WHERE user_id = $1 AND stage = $2
      `, [currentId, stage]);
      
      if (parent.rows.length === 0 || !parent.rows[0].parent_id) {
        rootId = currentId;
        break;
      }
      currentId = parent.rows[0].parent_id;
    }
    
    if (!rootId) rootId = parentId;
    
    // Pay the matrix owner
    await client.query(`
      INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount)
      VALUES ($1, $2, $3, $4)
    `, [rootId, newUserId, stage, stageConfig.bonus]);
    
    await client.query(`
      UPDATE wallets 
      SET balance = balance + $1, total_earned = total_earned + $1
      WHERE user_id = $2
    `, [stageConfig.bonus, rootId]);
    
    await client.query(`
      INSERT INTO transactions (user_id, type, amount, description, status)
      VALUES ($1, 'matrix_bonus', $2, $3, 'completed')
    `, [rootId, stageConfig.bonus, `${stage.toUpperCase()} stage bonus`]);
    
    // Update stage matrix count
    await client.query(`
      UPDATE stage_matrix 
      SET slots_filled = slots_filled + 1
      WHERE user_id = $1 AND stage = $2
    `, [rootId, stage]);
    
    // Check if matrix is complete
    const matrixCheck = await client.query(`
      SELECT slots_filled, slots_required FROM stage_matrix
      WHERE user_id = $1 AND stage = $2
    `, [rootId, stage]);
    
    if (matrixCheck.rows.length > 0) {
      const { slots_filled, slots_required } = matrixCheck.rows[0];
      if (slots_filled >= slots_required) {
        await this.completeStage(client, rootId, stage);
      }
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