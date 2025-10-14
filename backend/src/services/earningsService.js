const pool = require('../config/database');

const STAGE_EARNINGS = {
  feeder: 1.5,
  bronze: 4.8,
  silver: 30,
  gold: 150,
  diamond: 750,
  infinity: 15000
};

class EarningsService {
  
  async calculateUserEarnings(userId) {
    const result = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM referral_earnings
       WHERE user_id = $1 AND status = 'completed'`,
      [userId]
    );
    
    return parseFloat(result.rows[0].total);
  }
  
  async getEarningsByStage(userId) {
    const result = await pool.query(
      `SELECT stage, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
       FROM referral_earnings
       WHERE user_id = $1 AND status = 'completed'
       GROUP BY stage`,
      [userId]
    );
    
    return result.rows;
  }
  
  async processReferralEarning(sponsorId, referredUserId, stage) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const amount = STAGE_EARNINGS[stage] || STAGE_EARNINGS.feeder;
      
      await client.query(
        `UPDATE wallets 
         SET total_earned = total_earned + $1
         WHERE user_id = $2`,
        [amount, sponsorId]
      );
      
      await client.query(
        `INSERT INTO transactions (user_id, type, amount, description, status)
         VALUES ($1, 'mlm_earning', $2, $3, 'completed')`,
        [sponsorId, amount, `${stage} stage earning`]
      );
      
      await client.query(
        `INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount, status)
         VALUES ($1, $2, $3, $4, 'completed')`,
        [sponsorId, referredUserId, stage, amount]
      );
      
      await client.query('COMMIT');
      
      return { success: true, amount };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  async getStageProgress(userId) {
    const user = await pool.query(
      'SELECT mlm_level FROM users WHERE id = $1',
      [userId]
    );
    
    if (user.rows.length === 0) return null;
    
    const stage = user.rows[0].mlm_level;
    
    const matrix = await pool.query(
      `SELECT slots_filled, slots_required, is_complete
       FROM stage_matrix
       WHERE user_id = $1 AND stage = $2`,
      [userId, stage]
    );
    
    if (matrix.rows.length === 0) return null;
    
    return {
      stage,
      slotsFilled: matrix.rows[0].slots_filled,
      slotsRequired: matrix.rows[0].slots_required,
      isComplete: matrix.rows[0].is_complete,
      earningPerSlot: STAGE_EARNINGS[stage]
    };
  }
}

module.exports = new EarningsService();
