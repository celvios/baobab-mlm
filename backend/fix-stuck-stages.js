const pool = require('./src/config/database');

async function fixStuckStages() {
  const client = await pool.connect();
  
  try {
    console.log('Checking for users stuck at wrong stages...');
    
    // Find users at no_stage with 6+ qualified slots
    const stuckUsers = await client.query(`
      SELECT u.id, u.email, u.mlm_level, sm.qualified_slots_filled, sm.slots_required
      FROM users u
      JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = u.mlm_level
      WHERE sm.qualified_slots_filled >= sm.slots_required 
        AND sm.is_complete = false
    `);
    
    console.log(`Found ${stuckUsers.rows.length} users who should be upgraded`);
    
    for (const user of stuckUsers.rows) {
      console.log(`\nUpgrading user ${user.email} from ${user.mlm_level}...`);
      
      await client.query('BEGIN');
      
      try {
        const mlmService = require('./src/services/mlmService');
        await mlmService.checkLevelProgression(client, user.id);
        
        await client.query('COMMIT');
        console.log(`✓ Successfully upgraded ${user.email}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`✗ Failed to upgrade ${user.email}:`, error.message);
      }
    }
    
    console.log('\n✓ Stage fix completed!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

fixStuckStages();
