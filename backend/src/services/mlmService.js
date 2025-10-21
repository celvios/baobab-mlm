const pool = require('../config/database');

const MLM_LEVELS = {
  no_stage: { bonusUSD: 1.5, requiredReferrals: 6, matrixSize: '2x2' },
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
      SELECT u.mlm_level as current_stage, sm.slots_filled, sm.slots_required,
             COALESCE(sm.qualified_slots_filled, sm.slots_filled) as qualified_slots_filled,
             COALESCE(sm.is_complete, false) as is_complete
      FROM users u
      LEFT JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = u.mlm_level
      WHERE u.id = $1
    `, [userId]);
    
    if (stageResult.rows.length === 0) return;
    
    const { current_stage, qualified_slots_filled, slots_required, is_complete } = stageResult.rows[0];
    
    // Don't upgrade if already marked as complete (prevents double upgrades)
    if (is_complete) return;
    
    // Only progress if qualified slots are filled
    const isComplete = qualified_slots_filled >= slots_required;
    if (!isComplete) return;
    
    const stageProgression = {
      'no_stage': 'feeder',
      'feeder': 'bronze',
      'bronze': 'silver',
      'silver': 'gold',
      'gold': 'diamond',
      'diamond': 'infinity'
    };
    
    const newStage = stageProgression[current_stage];
    
    if (newStage) {
      const oldStage = current_stage;
      
      // Mark current stage as complete
      await client.query(`
        UPDATE stage_matrix SET is_complete = true WHERE user_id = $1 AND stage = $2
      `, [userId, current_stage]);
      
      // Update user stage
      await client.query('UPDATE users SET mlm_level = $1 WHERE id = $2', [newStage, userId]);

      // Create new stage_matrix entry for next stage
      const nextStageSlots = newStage === 'infinity' ? 0 : ((newStage === 'no_stage' || newStage === 'feeder') ? 6 : 14);
      await client.query(`
        INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required, qualified_slots_filled)
        VALUES ($1, $2, 0, $3, 0)
        ON CONFLICT (user_id, stage) DO NOTHING
      `, [userId, newStage, nextStageSlots]);

      // Record progression
      await client.query(`
        INSERT INTO level_progressions (user_id, from_stage, to_stage, matrix_count)
        VALUES ($1, $2, $3, $4)
      `, [userId, current_stage, newStage, qualified_slots_filled]);

      // Release held earnings when user reaches Feeder
      if (newStage === 'feeder' && oldStage === 'no_stage') {
        await this.releaseHeldEarnings(client, userId);
      }
      
      // Store incentive record
      if (stageIncentives.length > 0) {
        await client.query(`
          INSERT INTO user_incentives (user_id, stage, incentives, awarded_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        `, [userId, newStage, JSON.stringify(stageIncentives)]);
      }

      // Trigger retroactive updates for uplines
      await this.onUserStageUpgrade(client, userId, oldStage, newStage);

      // Get incentives for the new stage
      const incentives = {
        bronze: ['Lentoc water flask', 'Food voucher worth ₦100,000'],
        silver: ['Food voucher worth $150', 'Android Phone'],
        gold: ['Food voucher worth $750', 'International Trip worth ₦5m', 'Smartphone + Refrigerator/Generator/TV'],
        diamond: ['Food voucher worth $1,500', 'International trip worth $7,000', 'Brand new car worth $20,000', 'Chairman Award worth $10,000']
      };
      
      const stageIncentives = incentives[newStage] || [];
      const incentiveText = stageIncentives.length > 0 ? `\n\nYour incentives:\n${stageIncentives.map(i => `• ${i}`).join('\n')}` : '';
      
      // Send notification
      await client.query(`
        INSERT INTO market_updates (user_id, title, message, type)
        VALUES ($1, $2, $3, 'success')
      `, [userId, 'Stage Upgrade!', `Congratulations! You've been promoted to ${newStage.toUpperCase()} stage!${incentiveText}`]);
      
      // Send email notification
      try {
        const userEmail = await client.query('SELECT email, full_name FROM users WHERE id = $1', [userId]);
        if (userEmail.rows.length > 0) {
          const { email, full_name } = userEmail.rows[0];
          const sendgridService = require('../utils/sendgridService');
          await sendgridService.sendIncentiveEmail(email, full_name, newStage, stageIncentives);
        }
      } catch (emailError) {
        console.error('Failed to send incentive email:', emailError);
      }
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
    const stage = referrer.mlm_level || 'no_stage';
    
    // Ensure referrer has stage_matrix entry
    const stageSlots = (stage === 'no_stage' || stage === 'feeder') ? 6 : 14;
    await client.query(`
      INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
      VALUES ($1, $2, 0, $3)
      ON CONFLICT (user_id, stage) DO NOTHING
    `, [referrerId, stage, stageSlots]);
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

    // Get new user's current stage
    const newUserResult = await client.query('SELECT mlm_level FROM users WHERE id = $1', [userId]);
    const newUserStage = newUserResult.rows[0]?.mlm_level || 'no_stage';

    // Credit only the direct matrix owner (no upline chain)
    await this.creditDirectMatrixOwner(client, placementParentId, userId, stage, newUserStage);

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

  async creditDirectMatrixOwner(client, matrixOwnerId, newUserId, stage, newUserStage) {
    // Only credit the direct matrix owner (no upline chain)
    const userResult = await client.query(
      'SELECT id, mlm_level FROM users WHERE id = $1',
      [matrixOwnerId]
    );

    if (userResult.rows.length === 0) return [];

    const user = userResult.rows[0];
    const userStage = user.mlm_level || 'no_stage';
    const stageConfig = MLM_LEVELS[userStage] || MLM_LEVELS['feeder'];

    // Determine earning status based on user stage
    const earningStatus = (userStage === 'no_stage') ? 'held' : 'completed';
    
    // Add referral earning
    await client.query(
      'INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount, status) VALUES ($1, $2, $3, $4, $5)',
      [matrixOwnerId, newUserId, userStage, stageConfig.bonusUSD, earningStatus]
    );

    // Only update wallet and add transaction if user is Feeder or higher
    if (userStage !== 'no_stage') {
      await client.query(
        'UPDATE wallets SET total_earned = total_earned + $1 WHERE user_id = $2',
        [stageConfig.bonusUSD, matrixOwnerId]
      );

      await client.query(
        'INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5)',
        [matrixOwnerId, 'matrix_bonus', stageConfig.bonusUSD, `Matrix bonus at ${userStage} stage`, 'completed']
      );
    }

    // Update stage matrix slots
    await client.query(
      'UPDATE stage_matrix SET slots_filled = slots_filled + 1 WHERE user_id = $1 AND stage = $2',
      [matrixOwnerId, userStage]
    );

    // Track member in matrix
    // At no_stage: everyone with paid deposit counts
    // At feeder+: only members who completed the PREVIOUS stage count
    let isQualified = false;
    
    if (userStage === 'no_stage') {
      // At no_stage, any paid account counts
      isQualified = true;
    } else if (userStage === 'feeder') {
      // At feeder, only accounts that completed no_stage (have 6 paid accounts) count
      const memberMatrixCheck = await client.query(`
        SELECT is_complete FROM stage_matrix WHERE user_id = $1 AND stage = 'no_stage'
      `, [newUserId]);
      isQualified = memberMatrixCheck.rows.length > 0 && memberMatrixCheck.rows[0].is_complete === true;
    } else {
      // Get the required stage for this matrix
      const stageHierarchy = {
        'bronze': 'feeder',   // Bronze needs feeder-completed accounts
        'silver': 'bronze',   // Silver needs bronze-completed accounts
        'gold': 'silver',     // Gold needs silver-completed accounts
        'diamond': 'gold'     // Diamond needs gold-completed accounts
      };
      
      const requiredStage = stageHierarchy[userStage];
      if (requiredStage) {
        const memberMatrixCheck = await client.query(`
          SELECT is_complete FROM stage_matrix WHERE user_id = $1 AND stage = $2
        `, [newUserId, requiredStage]);
        isQualified = memberMatrixCheck.rows.length > 0 && memberMatrixCheck.rows[0].is_complete === true;
      }
    }
    await client.query(`
      INSERT INTO stage_matrix_members (matrix_owner_id, matrix_stage, member_id, member_stage_at_placement, is_qualified, qualified_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (matrix_owner_id, matrix_stage, member_id) DO NOTHING
    `, [matrixOwnerId, userStage, newUserId, newUserStage, isQualified, isQualified ? new Date() : null]);

    // Update qualified slots only if member is qualified
    if (isQualified) {
      await client.query(
        'UPDATE stage_matrix SET qualified_slots_filled = COALESCE(qualified_slots_filled, 0) + 1 WHERE user_id = $1 AND stage = $2',
        [matrixOwnerId, userStage]
      );
    }

    // Check for level progression
    await this.checkLevelProgression(client, matrixOwnerId);

    return [matrixOwnerId];
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
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_earned,
        SUM(CASE WHEN status = 'held' THEN amount ELSE 0 END) as held_earnings
      FROM referral_earnings 
      WHERE user_id = $1
      GROUP BY stage
      ORDER BY 
        CASE stage
          WHEN 'no_stage' THEN 0
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
      SELECT u.id, u.full_name, u.email, u.mlm_level, u.is_active, u.created_at, u.referral_code,
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

    // Recursively fetch children for each team member
    const membersWithChildren = await Promise.all(
      result.rows.map(async (member) => {
        const children = await this.getTeamMembersRecursive(member.id);
        return { ...member, children };
      })
    );

    return membersWithChildren;
  }

  async getTeamMembersRecursive(userId) {
    const result = await pool.query(`
      SELECT u.id, u.full_name, u.email, u.mlm_level, u.is_active, u.created_at, u.referral_code,
             CASE 
               WHEN EXISTS (SELECT 1 FROM deposit_requests WHERE user_id = u.id AND status = 'approved') 
               THEN true 
               ELSE false 
             END as has_deposited
      FROM users u
      WHERE u.referred_by IN (SELECT referral_code FROM users WHERE id = $1)
      ORDER BY u.created_at DESC
    `, [userId]);

    // Recursively fetch children for each member
    const membersWithChildren = await Promise.all(
      result.rows.map(async (member) => {
        const children = await this.getTeamMembersRecursive(member.id);
        return { ...member, children };
      })
    );

    return membersWithChildren;
  }

  async getStageProgress(userId) {
    const result = await pool.query(`
      SELECT u.mlm_level as current_stage,
             COALESCE(sm.qualified_slots_filled, 0) as slots_filled,
             COALESCE(sm.qualified_slots_filled, 0) as qualified_slots_filled,
             COALESCE(sm.slots_required, 6) as slots_required,
             COALESCE(sm.qualified_slots_filled >= sm.slots_required, false) as is_complete
      FROM users u
      LEFT JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = u.mlm_level
      WHERE u.id = $1
    `, [userId]);

    return result.rows[0] || null;
  }

  async onUserStageUpgrade(client, userId, fromStage, toStage) {
    // Find all upline matrices that have this user as unqualified member
    const uplineMatrices = await client.query(`
      SELECT DISTINCT smm.matrix_owner_id, smm.matrix_stage
      FROM stage_matrix_members smm
      WHERE smm.member_id = $1 
        AND smm.is_qualified = false
        AND smm.matrix_stage = $2
    `, [userId, toStage]);

    for (const matrix of uplineMatrices.rows) {
      // Mark as qualified
      await client.query(`
        UPDATE stage_matrix_members 
        SET is_qualified = true, qualified_at = CURRENT_TIMESTAMP
        WHERE matrix_owner_id = $1 AND matrix_stage = $2 AND member_id = $3
      `, [matrix.matrix_owner_id, matrix.matrix_stage, userId]);

      // Increment qualified slots
      await client.query(`
        UPDATE stage_matrix 
        SET qualified_slots_filled = COALESCE(qualified_slots_filled, 0) + 1
        WHERE user_id = $1 AND stage = $2
      `, [matrix.matrix_owner_id, matrix.matrix_stage]);

      // Check if upline can now progress
      await this.checkLevelProgression(client, matrix.matrix_owner_id);
    }
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

  async releaseHeldEarnings(client, userId) {
    // Get all held earnings for this user
    const heldEarnings = await client.query(
      'SELECT * FROM referral_earnings WHERE user_id = $1 AND status = $2',
      [userId, 'held']
    );

    if (heldEarnings.rows.length === 0) return;

    let totalAmount = 0;
    
    // Update all held earnings to completed
    for (const earning of heldEarnings.rows) {
      await client.query(
        'UPDATE referral_earnings SET status = $1 WHERE id = $2',
        ['completed', earning.id]
      );
      
      totalAmount += parseFloat(earning.amount);
      
      // Add transaction for each released earning
      await client.query(
        'INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5)',
        [userId, 'matrix_bonus', earning.amount, `Released held earning from ${earning.stage} stage`, 'completed']
      );
    }

    // Update wallet with total released amount
    if (totalAmount > 0) {
      await client.query(
        'UPDATE wallets SET total_earned = total_earned + $1 WHERE user_id = $2',
        [totalAmount, userId]
      );

      // Send notification
      await client.query(`
        INSERT INTO market_updates (user_id, title, message, type)
        VALUES ($1, $2, $3, 'success')
      `, [userId, 'Earnings Released!', `Your held earnings of $${totalAmount.toFixed(2)} have been released to your wallet!`]);
    }
  }

  async completeUserMatrix(userId, currentStage) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const stageConfig = MLM_LEVELS[currentStage];
      if (!stageConfig) {
        throw new Error('Invalid stage');
      }

      const userResult = await client.query(
        'SELECT referral_code FROM users WHERE id = $1',
        [userId]
      );
      const referralCode = userResult.rows[0].referral_code;

      // Determine what stage the generated accounts should be at
      // no_stage: generate no_stage accounts (just paid)
      // feeder: generate feeder accounts (completed no_stage)
      // bronze+: generate accounts that completed previous stage
      const generatedAccountStage = currentStage === 'no_stage' ? 'no_stage' : currentStage;
      const generatedUsers = [];
      const directReferrals = [];

      // Generate 2 direct referrals
      for (let i = 0; i < 2; i++) {
        const newUser = await client.query(`
          INSERT INTO users (full_name, email, password, phone, referral_code, referred_by, mlm_level, is_active, is_email_verified)
          VALUES ($1, $2, $3, $4, $5, $6, $7, true, true)
          RETURNING id, full_name, email, referral_code
        `, [
          `Direct Referral ${i + 1}`,
          `direct_${Date.now()}_${i}@test.com`,
          '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          `+234${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
          `DIR${Date.now()}${i}`,
          referralCode,
          generatedAccountStage
        ]);

        directReferrals.push(newUser.rows[0]);
        generatedUsers.push(newUser.rows[0]);

        await client.query(`
          INSERT INTO deposit_requests (user_id, amount, status)
          VALUES ($1, 18000, 'approved')
        `, [newUser.rows[0].id]);

        await client.query(`
          INSERT INTO wallets (user_id, balance, total_earned)
          VALUES ($1, 0, 0)
        `, [newUser.rows[0].id]);

        // Mark previous stage as complete if not no_stage
        if (generatedAccountStage !== 'no_stage') {
          const prevStageMap = { 'feeder': 'no_stage', 'bronze': 'feeder', 'silver': 'bronze', 'gold': 'silver', 'diamond': 'gold' };
          const prevStage = prevStageMap[generatedAccountStage];
          if (prevStage) {
            await client.query(`
              INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required, qualified_slots_filled, is_complete)
              VALUES ($1, $2, 6, 6, 6, true)
            `, [newUser.rows[0].id, prevStage]);
          }
        }

        await client.query(`
          INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
          VALUES ($1, $2, 0, $3)
        `, [newUser.rows[0].id, generatedAccountStage, (generatedAccountStage === 'no_stage' || generatedAccountStage === 'feeder') ? 6 : 14]);
      }

      // Process direct referrals first
      for (const directRef of directReferrals) {
        await this.processReferral(userId, directRef.id);
      }

      // Generate 4 spillover referrals (2 for each direct referral)
      for (let i = 0; i < 2; i++) {
        const parentReferral = directReferrals[i];
        
        for (let j = 0; j < 2; j++) {
          const spilloverUser = await client.query(`
            INSERT INTO users (full_name, email, password, phone, referral_code, referred_by, mlm_level, is_active, is_email_verified)
            VALUES ($1, $2, $3, $4, $5, $6, $7, true, true)
            RETURNING id, full_name, email, referral_code
          `, [
            `Spillover ${i + 1}-${j + 1}`,
            `spillover_${Date.now()}_${i}_${j}@test.com`,
            '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            `+234${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
            `SPILL${Date.now()}${i}${j}`,
            parentReferral.referral_code,
            generatedAccountStage
          ]);

          generatedUsers.push(spilloverUser.rows[0]);

          await client.query(`
            INSERT INTO deposit_requests (user_id, amount, status)
            VALUES ($1, 18000, 'approved')
          `, [spilloverUser.rows[0].id]);

          await client.query(`
            INSERT INTO wallets (user_id, balance, total_earned)
            VALUES ($1, 0, 0)
          `, [spilloverUser.rows[0].id]);

          // Mark previous stage as complete if not no_stage
          if (generatedAccountStage !== 'no_stage') {
            const prevStageMap = { 'feeder': 'no_stage', 'bronze': 'feeder', 'silver': 'bronze', 'gold': 'silver', 'diamond': 'gold' };
            const prevStage = prevStageMap[generatedAccountStage];
            if (prevStage) {
              await client.query(`
                INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required, qualified_slots_filled, is_complete)
                VALUES ($1, $2, 6, 6, 6, true)
              `, [spilloverUser.rows[0].id, prevStage]);
            }
          }

          await client.query(`
            INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
            VALUES ($1, $2, 0, $3)
          `, [spilloverUser.rows[0].id, generatedAccountStage, (generatedAccountStage === 'no_stage' || generatedAccountStage === 'feeder') ? 6 : 14]);

          // Process spillover through parent's referral
          await this.processReferral(parentReferral.id, spilloverUser.rows[0].id);
        }
      }

      await client.query('COMMIT');

      return {
        generatedUsers: generatedUsers.length,
        directReferrals: 2,
        spilloverReferrals: 4,
        users: generatedUsers
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