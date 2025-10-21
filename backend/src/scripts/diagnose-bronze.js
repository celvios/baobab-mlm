const pool = require('../config/database');

async function diagnoseBronze() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Diagnosing Bronze users...\n');
    
    const bronzeUsers = await client.query(`
      SELECT u.id, u.full_name, u.email, u.mlm_level,
             w.total_earned, w.balance
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE u.mlm_level = 'bronze'
      LIMIT 3
    `);
    
    for (const user of bronzeUsers.rows) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`👤 ${user.full_name} (${user.email})`);
      console.log(`   Stage: ${user.mlm_level}`);
      console.log(`   Wallet Total Earned: $${parseFloat(user.total_earned || 0).toFixed(2)} (₦${(parseFloat(user.total_earned || 0) * 1500).toFixed(0)})`);
      
      // Get all earnings
      const earnings = await client.query(`
        SELECT stage, amount, status, created_at
        FROM referral_earnings
        WHERE user_id = $1
        ORDER BY created_at
      `, [user.id]);
      
      console.log(`\n   📊 Referral Earnings (${earnings.rows.length} total):`);
      
      const byStage = {};
      for (const e of earnings.rows) {
        if (!byStage[e.stage]) byStage[e.stage] = { count: 0, total: 0, status: e.status };
        byStage[e.stage].count++;
        byStage[e.stage].total += parseFloat(e.amount);
      }
      
      for (const [stage, data] of Object.entries(byStage)) {
        console.log(`     ${stage}: ${data.count} × $${(data.total / data.count).toFixed(2)} = $${data.total.toFixed(2)} (${data.status})`);
      }
      
      // Get qualified members
      const qualified = await client.query(`
        SELECT COUNT(*) as count
        FROM stage_matrix_members
        WHERE matrix_owner_id = $1 AND matrix_stage = 'bronze' AND is_qualified = true
      `, [user.id]);
      
      console.log(`\n   ✅ Qualified Bronze Members: ${qualified.rows[0].count}`);
      console.log(`   💰 Expected: ${qualified.rows[0].count} × $4.8 = $${(qualified.rows[0].count * 4.8).toFixed(2)} (₦${(qualified.rows[0].count * 4.8 * 1500).toFixed(0)})`);
      
      // Get stage matrix info
      const matrix = await client.query(`
        SELECT slots_filled, qualified_slots_filled, slots_required, is_complete
        FROM stage_matrix
        WHERE user_id = $1 AND stage = 'bronze'
      `, [user.id]);
      
      if (matrix.rows.length > 0) {
        const m = matrix.rows[0];
        console.log(`\n   📈 Bronze Matrix: ${m.qualified_slots_filled || 0}/${m.slots_required} qualified (${m.slots_filled} total)`);
      }
    }
    
    console.log(`\n${'='.repeat(80)}\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

diagnoseBronze();
