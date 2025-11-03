const pool = require('./src/config/database');

async function fixMatrixCounts() {
  const client = await pool.connect();
  try {
    console.log('Recalculating matrix counts from actual matrix structure...\n');

    // Get all users with matrices
    const users = await client.query(`
      SELECT DISTINCT user_id, stage FROM mlm_matrix ORDER BY user_id, stage
    `);

    for (const user of users.rows) {
      // Count actual members in this user's matrix tree
      const count = await countMatrixMembers(client, user.user_id, user.stage);
      
      console.log(`User ${user.user_id} - ${user.stage}: ${count} members`);

      // Update stage_matrix with correct counts
      await client.query(`
        UPDATE stage_matrix 
        SET slots_filled = $1, qualified_slots_filled = $1
        WHERE user_id = $2 AND stage = $3
      `, [count, user.user_id, user.stage]);
    }

    console.log('\n✓ Matrix counts fixed!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

async function countMatrixMembers(client, rootUserId, stage) {
  // Count members using stage_matrix_members table
  const result = await client.query(`
    SELECT COUNT(*) as count 
    FROM stage_matrix_members 
    WHERE matrix_owner_id = $1 AND matrix_stage = $2
  `, [rootUserId, stage]);

  return parseInt(result.rows[0].count) || 0;
}

fixMatrixCounts();
