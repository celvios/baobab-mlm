const pool = require('./src/config/database');
const mlmService = require('./src/services/mlmService');

async function fixCompletedMatrices() {
  const client = await pool.connect();
  try {
    console.log('Finding users with completed matrices...');
    
    const result = await client.query(`
      SELECT u.id, u.full_name, u.mlm_level, sm.qualified_slots_filled, sm.slots_required
      FROM users u
      JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = u.mlm_level
      WHERE sm.qualified_slots_filled >= sm.slots_required 
        AND sm.is_complete = false
      ORDER BY u.id
    `);

    console.log(`Found ${result.rows.length} users with completed matrices`);

    for (const user of result.rows) {
      console.log(`\nProcessing ${user.full_name} (ID: ${user.id})`);
      console.log(`  Current stage: ${user.mlm_level}`);
      console.log(`  Slots: ${user.qualified_slots_filled}/${user.slots_required}`);

      await client.query('BEGIN');
      try {
        await mlmService.checkLevelProgression(client, user.id);
        await client.query('COMMIT');
        console.log(`  ✓ Upgraded successfully`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`  ✗ Error: ${error.message}`);
      }
    }

    console.log('\n✓ All completed matrices processed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixCompletedMatrices();
