const pool = require('../config/database');

class MatrixService {
  
  getMatrixConfig(stage) {
    return {
      feeder: { levels: 2, totalSlots: 6, earningPerSlot: 1.5 },
      bronze: { levels: 3, totalSlots: 14, earningPerSlot: 4.8 },
      silver: { levels: 3, totalSlots: 14, earningPerSlot: 30 },
      gold: { levels: 3, totalSlots: 14, earningPerSlot: 150 },
      diamond: { levels: 3, totalSlots: 14, earningPerSlot: 750 },
      infinity: { levels: 3, totalSlots: 14, earningPerSlot: 15000 }
    }[stage] || { levels: 2, totalSlots: 6, earningPerSlot: 1.5 };
  }
  
  async findNextPosition(parentUserId, stage) {
    const positions = await pool.query(
      `SELECT position_path FROM matrix_positions 
       WHERE parent_user_id = $1 AND stage = $2
       ORDER BY position_path`,
      [parentUserId, stage]
    );
    
    const config = this.getMatrixConfig(stage);
    const allPositions = this.generateAllPositions(config.levels);
    const occupiedPaths = positions.rows.map(p => p.position_path);
    
    return allPositions.find(pos => !occupiedPaths.includes(pos)) || null;
  }
  
  generateAllPositions(levels) {
    const positions = [];
    
    function generate(path, level) {
      if (level > levels) return;
      if (level > 0) positions.push(path);
      if (level < levels) {
        generate(path + 'L', level + 1);
        generate(path + 'R', level + 1);
      }
    }
    
    generate('', 0);
    return positions;
  }
  
  async placeInMatrix(userId, sponsorId, stage) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const position = await this.findNextPosition(sponsorId, stage);
      
      if (!position) {
        throw new Error('No available positions in matrix');
      }
      
      const level = position.length;
      
      await client.query(
        `INSERT INTO matrix_positions (user_id, stage, position_path, parent_user_id, level_in_matrix)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, stage, position, sponsorId, level]
      );
      
      await this.updateEarnings(client, sponsorId, userId, stage);
      await this.checkMatrixCompletion(client, sponsorId, stage);
      
      await client.query('COMMIT');
      
      return { position, level };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  async updateEarnings(client, sponsorId, newUserId, stage) {
    const config = this.getMatrixConfig(stage);
    const amount = config.earningPerSlot;
    
    await client.query(
      `UPDATE wallets 
       SET total_earned = total_earned + $1
       WHERE user_id = $2`,
      [amount, sponsorId]
    );
    
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, description, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [sponsorId, 'mlm_earning', amount, `Earned from ${stage} matrix`, 'completed']
    );
    
    await client.query(
      `INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [sponsorId, newUserId, stage, amount, 'completed']
    );
  }
  
  async checkMatrixCompletion(client, userId, stage) {
    const config = this.getMatrixConfig(stage);
    
    const result = await client.query(
      `SELECT COUNT(*) as filled_slots
       FROM matrix_positions
       WHERE parent_user_id = $1 AND stage = $2`,
      [userId, stage]
    );
    
    const filledSlots = parseInt(result.rows[0].filled_slots);
    const isComplete = filledSlots >= config.totalSlots;
    
    await client.query(
      `UPDATE stage_matrix 
       SET slots_filled = $1, is_complete = $2, completed_at = CASE WHEN $2 THEN NOW() ELSE completed_at END
       WHERE user_id = $3 AND stage = $4`,
      [filledSlots, isComplete, userId, stage]
    );
    
    if (isComplete) {
      await this.progressToNextStage(client, userId, stage);
    }
    
    return { filledSlots, totalSlots: config.totalSlots, isComplete };
  }
  
  async progressToNextStage(client, userId, currentStage) {
    const stageProgression = {
      feeder: 'bronze',
      bronze: 'silver',
      silver: 'gold',
      gold: 'diamond',
      diamond: 'infinity'
    };
    
    const nextStage = stageProgression[currentStage];
    
    if (nextStage) {
      await client.query(
        'UPDATE users SET mlm_level = $1 WHERE id = $2',
        [nextStage, userId]
      );
      
      const nextConfig = this.getMatrixConfig(nextStage);
      
      await client.query(
        `INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
         VALUES ($1, $2, 0, $3)
         ON CONFLICT (user_id, stage) DO NOTHING`,
        [userId, nextStage, nextConfig.totalSlots]
      );
      
      await client.query(
        `INSERT INTO level_progressions (user_id, from_stage, to_stage, matrix_count)
         VALUES ($1, $2, $3, $4)`,
        [userId, currentStage, nextStage, nextConfig.totalSlots]
      );
    }
  }
}

module.exports = new MatrixService();
