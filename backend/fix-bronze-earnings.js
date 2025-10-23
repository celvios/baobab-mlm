const pool = require('./src/config/database');

const MLM_LEVELS = {
  no_stage: { bonusUSD: 1.5, requiredReferrals: 6 },
  feeder: { bonusUSD: 1.5, requiredReferrals: 6 },
  bronze: { bonusUSD: 4.8, requiredReferrals: 14 },
  silver: { bonusUSD: 30, requiredReferrals: 14 },
  gold: { bonusUSD: 150, requiredReferrals: 14 },
  diamond: { bonusUSD: 750, requiredReferrals: 14 }
};

async function fixBronzeEarnings() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Analyzing Bronze users earnings...\n');
    
    // Get all Bronze users
    const bronzeUsers = await client.query(`
      SELECT u.id, u.full_name, u.email, u.mlm_level,
             w.total_earned as wallet_earned,
             (SELECT COUNT(*) FROM referral_earnings WHERE user_id = u.id) as earnings_count,
             (SELECT SUM(amount) FROM referral_earnings WHERE user_id = u.id) as total_referral_earnings,
             (SELECT COUNT(*) FROM stage_matrix_members WHERE matrix_owner_id = u.id AND matrix_stage = 'bronze' AND is_qualified = true) as qualified_members
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE u.mlm_level = 'bronze'
    `);
    
    console.log(`Found ${bronzeUsers.rows.length} Bronze users\n`);
    
    for (const user of bronzeUsers.rows) {
      console.log(`\n📊 User: ${user.full_name} (${user.email})`);
      console.log(`   Current Stage: ${user.mlm_level}`);
      console.log(`   Wallet Total Earned: $${parseFloat(user.wallet_earned || 0).toFixed(2)}`);
      console.log(`   Referral Earnings Records: ${user.earnings_count}`);
      console.log(`   Total from Referral Earnings: $${parseFloat(user.total_referral_earnings || 0).toFixed(2)}`);
      console.log(`   Qualified Members in Bronze Matrix: ${user.qualified_members}`);
      
      // Calculate what they SHOULD have earned
      const expectedBronzeEarnings = user.qualified_members * MLM_LEVELS.bronze.bonusUSD;
      console.log(`   Expected Bronze Earnings: $${expectedBronzeEarnings.toFixed(2)} (${user.qualified_members} × $${MLM_LEVELS.bronze.bonusUSD})`);
      
      // Get breakdown by stage
      const earningsByStage = await client.query(`
        SELECT stage, COUNT(*) as count, SUM(amount) as total, status
        FROM referral_earnings
        WHERE user_id = $1
        GROUP BY stage, status
        ORDER BY stage, status
      `, [user.id]);
      
      console.log('\n   Earnings Breakdown:');
      for (const row of earningsByStage.rows) {
        console.log(`     ${row.stage}: ${row.count} referrals × $${(parseFloat(row.total) / row.count).toFixed(2)} = $${parseFloat(row.total).toFixed(2)} (${row.status})`);
      }
      
      // Check if earnings are incorrect
      const actualTotal = parseFloat(user.total_referral_earnings || 0);
      const difference = expectedBronzeEarnings - actualTotal;
      
      if (Math.abs(difference) > 0.01) {
        console.log(`\n   ⚠️  DISCREPANCY FOUND: $${Math.abs(difference).toFixed(2)} ${difference > 0 ? 'MISSING' : 'EXTRA'}`);
        console.log(`   💡 This user should have $${expectedBronzeEarnings.toFixed(2)} but has $${actualTotal.toFixed(2)}`);
      } else {
        console.log(`\n   ✅ Earnings are correct`);
      }
      
      console.log('\n' + '='.repeat(80));
    }
    
    console.log('\n\n📋 SUMMARY:');
    console.log('Bronze stage bonus rate: $4.8 per qualified member');
    console.log('Required qualified members: 14');
    console.log('Expected total at completion: $67.20 (₦67,200 at 1000:1 rate)');
    console.log('\nNote: Members must have completed Feeder stage to be qualified for Bronze matrix');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixBronzeEarnings();
