const pool = require('../config/database');

const MLM_LEVELS = {
  no_stage: { bonusUSD: 1.5 },
  feeder: { bonusUSD: 1.5 },
  bronze: { bonusUSD: 4.8 },
  silver: { bonusUSD: 30 },
  gold: { bonusUSD: 150 },
  diamond: { bonusUSD: 750 }
};

async function fixBronzeEarnings() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🔄 Fixing Bronze earnings...\n');
    
    const bronzeUsers = await client.query(`
      SELECT u.id, u.full_name, u.email, w.total_earned,
             (SELECT SUM(amount) FROM referral_earnings WHERE user_id = u.id) as total_referral
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE u.mlm_level = 'bronze'
    `);
    
    for (const user of bronzeUsers.rows) {
      console.log(`\n👤 ${user.full_name} (${user.email})`);
      console.log(`   Current: $${parseFloat(user.total_referral || 0).toFixed(2)}`);
      
      // Fix all earnings for this user
      const earnings = await client.query(`
        SELECT id, stage, amount FROM referral_earnings WHERE user_id = $1
      `, [user.id]);
      
      let corrected = 0;
      for (const earning of earnings.rows) {
        const correctAmount = MLM_LEVELS[earning.stage]?.bonusUSD || 1.5;
        if (Math.abs(parseFloat(earning.amount) - correctAmount) > 0.01) {
          await client.query('UPDATE referral_earnings SET amount = $1 WHERE id = $2', [correctAmount, earning.id]);
          corrected++;
        }
      }
      
      // Recalculate wallet
      const newTotal = await client.query(`
        SELECT COALESCE(SUM(amount), 0) as total FROM referral_earnings 
        WHERE user_id = $1 AND status = 'completed'
      `, [user.id]);
      
      await client.query('UPDATE wallets SET total_earned = $1 WHERE user_id = $2', 
        [newTotal.rows[0].total, user.id]);
      
      console.log(`   Fixed: ${corrected} earnings`);
      console.log(`   New Total: $${parseFloat(newTotal.rows[0].total).toFixed(2)} (₦${(parseFloat(newTotal.rows[0].total) * 1500).toFixed(0)})`);
    }
    
    await client.query('COMMIT');
    console.log('\n✅ Done!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixBronzeEarnings();
