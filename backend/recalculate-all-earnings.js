const pool = require('./src/config/database');

const MLM_LEVELS = {
  no_stage: { bonusUSD: 1.5 },
  feeder: { bonusUSD: 1.5 },
  bronze: { bonusUSD: 4.8 },
  silver: { bonusUSD: 30 },
  gold: { bonusUSD: 150 },
  diamond: { bonusUSD: 750 }
};

async function recalculateAllEarnings() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🔄 Recalculating all user earnings...\n');
    
    // Get all users with earnings
    const users = await client.query(`
      SELECT DISTINCT u.id, u.full_name, u.email, u.mlm_level
      FROM users u
      WHERE EXISTS (SELECT 1 FROM referral_earnings WHERE user_id = u.id)
      ORDER BY u.mlm_level
    `);
    
    console.log(`Found ${users.rows.length} users with earnings\n`);
    
    for (const user of users.rows) {
      console.log(`\n👤 Processing: ${user.full_name} (${user.mlm_level})`);
      
      // Get all referral earnings for this user
      const earnings = await client.query(`
        SELECT id, referred_user_id, stage, amount, status
        FROM referral_earnings
        WHERE user_id = $1
        ORDER BY created_at
      `, [user.id]);
      
      let correctedCount = 0;
      let totalCorrection = 0;
      
      for (const earning of earnings.rows) {
        const correctBonus = MLM_LEVELS[earning.stage]?.bonusUSD || 1.5;
        const currentAmount = parseFloat(earning.amount);
        
        if (Math.abs(currentAmount - correctBonus) > 0.01) {
          console.log(`   ⚠️  Correcting earning #${earning.id}: $${currentAmount} → $${correctBonus} (stage: ${earning.stage})`);
          
          // Update the earning amount
          await client.query(`
            UPDATE referral_earnings 
            SET amount = $1 
            WHERE id = $2
          `, [correctBonus, earning.id]);
          
          correctedCount++;
          totalCorrection += (correctBonus - currentAmount);
        }
      }
      
      if (correctedCount > 0) {
        console.log(`   ✅ Corrected ${correctedCount} earnings (total adjustment: $${totalCorrection.toFixed(2)})`);
        
        // Recalculate wallet total_earned
        const newTotal = await client.query(`
          SELECT COALESCE(SUM(amount), 0) as total
          FROM referral_earnings
          WHERE user_id = $1 AND status = 'completed'
        `, [user.id]);
        
        const newTotalEarned = parseFloat(newTotal.rows[0].total);
        
        await client.query(`
          UPDATE wallets
          SET total_earned = $1
          WHERE user_id = $2
        `, [newTotalEarned, user.id]);
        
        console.log(`   💰 Updated wallet total_earned to: $${newTotalEarned.toFixed(2)}`);
      } else {
        console.log(`   ✅ All earnings correct`);
      }
    }
    
    await client.query('COMMIT');
    console.log('\n\n✅ All earnings recalculated successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

recalculateAllEarnings();
