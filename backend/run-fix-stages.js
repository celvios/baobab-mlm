require('dotenv').config();
const pool = require('./src/config/database');

async function fixUserStages() {
  const client = await pool.connect();
  try {
    console.log('Starting user stages fix...');
    
    // Fix existing users without mlm_level
    const updateResult = await client.query(`
      UPDATE users 
      SET mlm_level = 'feeder' 
      WHERE mlm_level IS NULL OR mlm_level = '' OR mlm_level = 'no_stage'
    `);
    console.log(`✓ Updated ${updateResult.rowCount} users to feeder stage`);
    
    // Create stage_matrix entries for users who don't have one
    const insertResult = await client.query(`
      INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
      SELECT id, 'feeder', 0, 6
      FROM users
      WHERE id NOT IN (SELECT user_id FROM stage_matrix WHERE stage = 'feeder')
      ON CONFLICT (user_id, stage) DO NOTHING
    `);
    console.log(`✓ Created ${insertResult.rowCount} stage_matrix entries`);
    
    console.log('\n✅ User stages fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing user stages:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

fixUserStages();
