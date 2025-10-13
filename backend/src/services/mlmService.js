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

      // Place user in matrix and get placement info
      const placementInfo = await this.placeInMatrixWithSpillover(client, newUserId, referrerId, referrerLevel);

      await client.query('COMMIT');
      return { success: true, message: 'Referral processed successfully', placementInfo };
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

  async placeInMatrixWithSpillover(client, userId, referrerId, initialStage) {
    // Get referrer info
    const referrerResult = await client.query(
      'SELECT id, mlm_level, referral_code FROM users WHERE id = $1',
      [referrerId]
    );
    
    if (referrerResult.rows.length === 0) {
      throw new Error('Referrer not found');
    }

    const referrer = referrerResult.rows[0];
    const stage = referrer.mlm_level || 'feeder';
    const stageConfig = MLM_LEVELS[stage];

    // Find placement position in referrer's matrix for this stage
    let placementParentId = referrerId;
    let matrixEntry = await client.query(
      'SELECT * FROM mlm_matrix WHERE user_id = $1 AND stage = $2',
      [referrerId, stage]
    );

    // If referrer doesn't have matrix entry for this stage, create it
    if (matrixEntry.rows.length === 0) {
      await client.query(
        'INSERT INTO mlm_matrix (user_id, stage, position, parent_id) VALUES ($1, $2, 1, NULL)',
        [referrerId, stage]
      );
      matrixEntry = await client.query(
        'SELECT * FROM mlm_matrix WHERE user_id = $1 AND stage = $2',
        [referrerId, stage]
      );
    }

    // Find available slot in the matrix tree (breadth-first search)
    const availableSlot = await this.findAvailableMatrixSlot(client, referrerId, stage);
    
    if (availableSlot) {
      placementParentId = availableSlot.user_id;
      
      // Update parent's matrix with new child
      if (!availableSlot.left_child_id) {
        await client.query(
          'UPDATE mlm_matrix SET left_child_id = $1 WHERE id = $2',
          [userId, availableSlot.id]
        );
      } else {
        await client.query(
          'UPDATE mlm_matrix SET right_child_id = $1 WHERE id = $2',
          [userId, availableSlot.id]
        );
      }
    }

    // Create matrix entry for new user
    await client.query(
      'INSERT INTO mlm_matrix (user_id, stage, position, parent_id) VALUES ($1, $2, 1, $3)',
      [userId, stage, placementParentId]
    );

    // Credit all uplines in the matrix path
    await this.creditUplineChain(client, placementParentId, userId, stage);

    return { placementParentId, stage };
  }

  async findAvailableMatrixSlot(client, rootUserId, stage) {
    // Breadth-first search for first available slot
    const queue = [rootUserId];
    const visited = new Set();

    while (queue.length > 0) {
      const currentUserId = queue.shift();
      
      if (visited.has(currentUserId)) continue;
      visited.add(currentUserId);

      const matrixResult = await client.query(
        'SELECT * FROM mlm_matrix WHERE user_id = $1 AND stage = $2',
        [currentUserId, stage]
      );

      if (matrixResult.rows.length > 0) {
        const matrix = matrixResult.rows[0];
        
        // Check if this node has available slots
        if (!matrix.left_child_id || !matrix.right_child_id) {
          return matrix;
        }

        // Add children to queue
        if (matrix.left_child_id) queue.push(matrix.left_child_id);
        if (matrix.right_child_id) queue.push(matrix.right_child_id);
      }
    }

    return null;
  }

  async creditUplineChain(client, startUserId, newUserId, stage) {
    // Walk up the matrix tree and credit everyone
    let currentUserId = startUserId;
    const creditedUsers = [];

    while (currentUserId) {
      // Get user's current stage
      const userResult = await client.query(
        'SELECT id, mlm_level FROM users WHERE id = $1',
        [currentUserId]
      );

      if (userResult.rows.length === 0) break;

      const user = userResult.rows[0];
      const userStage = user.mlm_level || 'feeder';
      const stageConfig = MLM_LEVELS[userStage];

      // Only credit if user is at same or higher stage
      if (this.isStageEqualOrHigher(userStage, stage)) {
        // Add referral earning
        await client.query(
          'INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount, status) VALUES ($1, $2, $3, $4, $5)',
          [currentUserId, newUserId, userStage, stageConfig.bonusUSD, 'completed']
        );

        // Update wallet
        await client.query(
          'UPDATE wallets SET total_earned = total_earned + $1 WHERE user_id = $2',
          [stageConfig.bonusUSD, currentUserId]
        );

        // Add transaction
        await client.query(
          'INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5)',
          [currentUserId, 'matrix_bonus', stageConfig.bonusUSD, `Matrix bonus from spillover at ${userStage} stage`, 'completed']
        );

        // Update stage matrix slots
        await client.query(
          'UPDATE stage_matrix SET slots_filled = slots_filled + 1, is_complete = (slots_filled + 1 >= slots_required), completed_at = CASE WHEN (slots_filled + 1 >= slots_required) THEN CURRENT_TIMESTAMP ELSE completed_at END WHERE user_id = $1 AND stage = $2',
          [currentUserId, userStage]
        );

        // Check for level progression
        await this.checkLevelProgression(client, currentUserId);

        creditedUsers.push(currentUserId);
      }

      // Move to parent in matrix
      const parentResult = await client.query(
        'SELECT parent_id FROM mlm_matrix WHERE user_id = $1 AND stage = $2',
        [currentUserId, stage]
      );

      currentUserId = parentResult.rows[0]?.parent_id || null;
    }

    return creditedUsers;
  }

  isStageEqualOrHigher(userStage, requiredStage) {
    const stageOrder = ['feeder', 'bronze', 'silver', 'gold', 'diamond', 'infinity'];
    const userIndex = stageOrder.indexOf(userStage);
    const requiredIndex = stageOrder.indexOf(requiredStage);
    return userIndex >= requiredIndex;
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
             COALESCE(re.amount, 0) as earning_from_user,
             CASE 
               WHEN EXISTS (SELECT 1 FROM deposit_requests WHERE user_id = u.id AND status = 'approved') 
               THEN true 
               ELSE false 
             END as has_deposited
      FROM users u
      LEFT JOIN referral_earnings re ON u.id = re.referred_user_id AND re.user_id = $1
      WHERE u.referred_by IN (SELECT referral_code FROM users WHERE id = $1)
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

  async getFullMatrixTree(userId) {
    // Get user's current stage
    const userResult = await pool.query(
      'SELECT id, full_name, email, mlm_level FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];
    const stage = user.mlm_level || 'feeder';

    // Build tree recursively
    const tree = await this.buildMatrixNode(userId, stage, 0);
    return tree;
  }

  async buildMatrixNode(userId, stage, depth) {
    // Limit depth to prevent infinite recursion
    if (depth > 5) return null;

    // Get user info
    const userResult = await pool.query(
      'SELECT id, full_name, email, mlm_level FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) return null;

    const user = userResult.rows[0];

    // Get matrix entry
    const matrixResult = await pool.query(
      'SELECT * FROM mlm_matrix WHERE user_id = $1 AND stage = $2',
      [userId, stage]
    );

    const node = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      mlm_level: user.mlm_level,
      stage: stage,
      children: []
    };

    if (matrixResult.rows.length > 0) {
      const matrix = matrixResult.rows[0];

      // Get left child
      if (matrix.left_child_id) {
        const leftChild = await this.buildMatrixNode(matrix.left_child_id, stage, depth + 1);
        if (leftChild) node.children.push(leftChild);
      }

      // Get right child
      if (matrix.right_child_id) {
        const rightChild = await this.buildMatrixNode(matrix.right_child_id, stage, depth + 1);
        if (rightChild) node.children.push(rightChild);
      }
    }

    return node;
  }

  async completeUserMatrix(userId, currentStage) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const stageConfig = MLM_LEVELS[currentStage];
      if (!stageConfig) {
        throw new Error('Invalid stage');
      }

      const matrixResult = await client.query(
        'SELECT slots_filled, slots_required FROM stage_matrix WHERE user_id = $1 AND stage = $2',
        [userId, currentStage]
      );

      let slotsNeeded = stageConfig.requiredReferrals;
      if (matrixResult.rows.length > 0) {
        slotsNeeded = stageConfig.requiredReferrals - matrixResult.rows[0].slots_filled;
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
          INSERT INTO users (full_name, email, password, phone, referral_code, referred_by, mlm_level, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, 'feeder', true)
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
          INSERT INTO deposit_requests (user_id, amount, status)
          VALUES ($1, 18000, 'approved')
        `, [newUser.rows[0].id]);

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
        `, [userId, newUser.rows[0].id, currentStage, stageConfig.bonusUSD]);

        earnings.push(earning.rows[0]);

        await client.query(`
          UPDATE wallets SET total_earned = total_earned + $1
          WHERE user_id = $2
        `, [stageConfig.bonusUSD, userId]);

        await client.query(`
          INSERT INTO transactions (user_id, type, amount, description, status)
          VALUES ($1, 'referral_bonus', $2, $3, 'completed')
        `, [userId, stageConfig.bonusUSD, `Referral bonus from ${newUser.rows[0].full_name} at ${currentStage} stage`]);
      }

      await client.query(`
        UPDATE stage_matrix 
        SET slots_filled = slots_required, is_complete = true, completed_at = NOW()
        WHERE user_id = $1 AND stage = $2
      `, [userId, currentStage]);

      const stageProgression = {
        'feeder': 'bronze',
        'bronze': 'silver',
        'silver': 'gold',
        'gold': 'diamond',
        'diamond': 'infinity'
      };

      const nextStage = stageProgression[currentStage];

      if (nextStage) {
        await client.query(`
          UPDATE users SET mlm_level = $1 WHERE id = $2
        `, [nextStage, userId]);

        const nextStageSlots = nextStage === 'infinity' ? 0 : (nextStage === 'feeder' ? 6 : 14);
        await client.query(`
          INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
          VALUES ($1, $2, 0, $3)
          ON CONFLICT (user_id, stage) DO NOTHING
        `, [userId, nextStage, nextStageSlots]);

        await client.query(`
          INSERT INTO level_progressions (user_id, from_stage, to_stage, matrix_count)
          VALUES ($1, $2, $3, 1)
        `, [userId, currentStage, nextStage]);
      }

      await client.query('COMMIT');

      return {
        generatedUsers: generatedUsers.length,
        totalEarnings: earnings.reduce((sum, e) => sum + parseFloat(e.amount), 0),
        completedStage: currentStage,
        newStage: nextStage || 'infinity',
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

module.exports = new MLMService();