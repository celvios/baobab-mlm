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
  // Count all nodes in the matrix tree under this root
  const result = await client.query(`
    WITH RECURSIVE matrix_tree AS (
      -- Start with the root user's direct children
      SELECT left_child_id as user_id FROM mlm_matrix 
      WHERE user_id = $1 AND stage = $2 AND left_child_id IS NOT NULL
      UNION
      SELECT right_child_id as user_id FROM mlm_matrix 
      WHERE user_id = $1 AND stage = $2 AND right_child_id IS NOT NULL
      
      UNION ALL
      
      -- Recursively get all descendants
      SELECT m.left_child_id FROM matrix_tree mt
      JOIN mlm_matrix m ON mt.user_id = m.user_id AND m.stage = $2
      WHERE m.left_child_id IS NOT NULL
      
      UNION ALL
      
      SELECT m.right_child_id FROM matrix_tree mt
      JOIN mlm_matrix m ON mt.user_id = m.user_id AND m.stage = $2
      WHERE m.right_child_id IS NOT NULL
    )
    SELECT COUNT(DISTINCT user_id) as count FROM matrix_tree
  `, [rootUserId, stage]);

  return parseInt(result.rows[0].count) || 0;
}

fixMatrixCounts();
