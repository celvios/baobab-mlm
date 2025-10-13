require('dotenv').config();
const pool = require('./src/config/database');

async function syncMatrix() {
  const client = await pool.connect();
  try {
    console.log('Starting matrix sync...\n');
    
    // Get all users with approved deposits who have a referrer
    const paidUsers = await client.query(`
      SELECT u.id, u.full_name, u.email, u.referred_by, u.mlm_level
      FROM users u
      WHERE u.referred_by IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM deposit_requests dr 
        WHERE dr.user_id = u.id AND dr.status = 'approved'
      )
      ORDER BY u.created_at ASC
    `);
    
    console.log(`Found ${paidUsers.rows.length} paid users with referrers\n`);
    
    for (const user of paidUsers.rows) {
      // Get referrer
      const referrerResult = await client.query(
        'SELECT id, mlm_level FROM users WHERE referral_code = $1',
        [user.referred_by]
      );
      
      if (referrerResult.rows.length === 0) {
        console.log(`⚠️  Skipping ${user.email} - referrer not found`);
        continue;
      }
      
      const referrer = referrerResult.rows[0];
      const referrerStage = referrer.mlm_level || 'feeder';
      
      // Check if already in stage_matrix
      const matrixCheck = await client.query(
        'SELECT slots_filled FROM stage_matrix WHERE user_id = $1 AND stage = $2',
        [referrer.id, referrerStage]
      );
      
      // Update or create stage_matrix entry
      if (matrixCheck.rows.length === 0) {
        await client.query(
          'INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required) VALUES ($1, $2, 1, 6) ON CONFLICT (user_id, stage) DO NOTHING',
          [referrer.id, referrerStage]
        );
        console.log(`✓ Created matrix entry for referrer (1/6)`);
      } else {
        await client.query(
          'UPDATE stage_matrix SET slots_filled = slots_filled + 1, is_complete = (slots_filled + 1 >= slots_required) WHERE user_id = $1 AND stage = $2 AND slots_filled < slots_required',
          [referrer.id, referrerStage]
        );
        console.log(`✓ Updated matrix for referrer (${matrixCheck.rows[0].slots_filled + 1}/6)`);
      }
      
      console.log(`  ${user.email} → counted in ${referrer.id}'s matrix\n`);
    }
    
    console.log('\n✅ Matrix sync completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing matrix:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

syncMatrix();
