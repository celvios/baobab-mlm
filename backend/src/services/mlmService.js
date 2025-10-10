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

      // Get referrer's current level
      const referrerResult = await client.query(
        'SELECT mlm_level FROM users WHERE id = $1',
        [referrerId]
      );
      
      if (referrerResult.rows.length === 0) {
        throw new Error('Referrer not found');
      }

      const referrerLevel = referrerResult.rows[0].mlm_level || 'no_stage';
      const levelConfig = MLM_LEVELS[referrerLevel] || MLM_LEVELS['no_stage'];

      // Add referral earning (stored separately, not in wallet)
      await client.query(`
        INSERT INTO referral_earnings (user_id, referred_user_id, level, amount, status)
        VALUES ($1, $2, $3, $4, 'completed')
      `, [referrerId, newUserId, referrerLevel, levelConfig.bonusUSD]);

      // Add transaction record for tracking
      await client.query(`
        INSERT INTO transactions (user_id, type, amount, description, status)
        VALUES ($1, 'referral_bonus', $2, $3, 'completed')
      `, [referrerId, levelConfig.bonusUSD, `Referral bonus for ${referrerLevel} level`]);

      // Check for level progression
      await this.checkLevelProgression(client, referrerId);

      // Place user in matrix
      await this.placeInMatrix(client, newUserId, referrerId, referrerLevel);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async checkLevelProgression(client, userId) {
    // Get current referral count
    const referralCount = await client.query(
      'SELECT COUNT(*) FROM users WHERE referred_by = (SELECT referral_code FROM users WHERE id = $1)',
      [userId]
    );

    const count = parseInt(referralCount.rows[0].count);
    
    // Get current level
    const userResult = await client.query('SELECT mlm_level FROM users WHERE id = $1', [userId]);
    const currentLevel = userResult.rows[0].mlm_level;

    let newLevel = currentLevel;

    // Check progression rules
    if (currentLevel === 'no_stage' && count >= 6) {
      newLevel = 'feeder';
    } else if (currentLevel === 'feeder' && count >= 6) {
      newLevel = 'bronze';
    } else if (currentLevel === 'bronze' && count >= 20) { // 6 + 14
      newLevel = 'silver';
    } else if (currentLevel === 'silver' && count >= 34) { // 20 + 14
      newLevel = 'gold';
    } else if (currentLevel === 'gold' && count >= 48) { // 34 + 14
      newLevel = 'diamond';
    } else if (currentLevel === 'diamond' && count >= 62) { // 48 + 14
      newLevel = 'infinity';
    }

    if (newLevel !== currentLevel) {
      // Update user level
      await client.query('UPDATE users SET mlm_level = $1 WHERE id = $2', [newLevel, userId]);

      // Record progression
      await client.query(`
        INSERT INTO level_progressions (user_id, from_level, to_level, referrals_count)
        VALUES ($1, $2, $3, $4)
      `, [userId, currentLevel, newLevel, count]);

      // Send notification
      await client.query(`
        INSERT INTO market_updates (user_id, title, message, type)
        VALUES ($1, $2, $3, 'success')
      `, [userId, 'Level Up!', `Congratulations! You've been promoted to ${newLevel.toUpperCase()} level!`]);
    }
  }

  async placeInMatrix(client, userId, parentId, level) {
    // Simple matrix placement - find next available position
    const matrixResult = await client.query(`
      SELECT * FROM mlm_matrix 
      WHERE level = $1 AND (left_child_id IS NULL OR right_child_id IS NULL)
      ORDER BY created_at ASC
      LIMIT 1
    `, [level]);

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
      INSERT INTO mlm_matrix (user_id, level, position, parent_id)
      VALUES ($1, $2, $3, $4)
    `, [userId, level, position, actualParentId]);
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
      ORDER BY m.level, m.position
    `, [userId]);

    return result.rows;
  }

  async getUserEarnings(userId) {
    const result = await pool.query(`
      SELECT 
        level,
        COUNT(*) as referrals_count,
        SUM(amount) as total_earned
      FROM referral_earnings 
      WHERE user_id = $1 AND status = 'completed'
      GROUP BY level
      ORDER BY 
        CASE level
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
}

module.exports = new MLMService();