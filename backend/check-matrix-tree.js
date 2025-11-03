const pool = require('./src/config/database');

async function checkMatrixTree(rootUserId, stage) {
  const client = await pool.connect();
  try {
    console.log(`\nMatrix tree for user ${rootUserId} at ${stage} stage:\n`);

    // Get all matrix entries for this stage
    const result = await client.query(`
      SELECT m.*, u.full_name
      FROM mlm_matrix m
      JOIN users u ON m.user_id = u.id
      WHERE m.stage = $1
      ORDER BY m.user_id
    `, [stage]);

    console.log('All matrix entries:');
    result.rows.forEach(row => {
      console.log(`  ${row.full_name} (ID: ${row.user_id})`);
      console.log(`    Parent: ${row.parent_id || 'ROOT'}`);
      console.log(`    Left child: ${row.left_child_id || 'none'}`);
      console.log(`    Right child: ${row.right_child_id || 'none'}\n`);
    });

    // Check stage_matrix_members
    console.log('\nstage_matrix_members for user 4846:');
    const members = await client.query(`
      SELECT smm.*, u.full_name
      FROM stage_matrix_members smm
      JOIN users u ON smm.member_id = u.id
      WHERE smm.matrix_owner_id = $1 AND smm.matrix_stage = $2
    `, [rootUserId, stage]);

    members.rows.forEach(m => {
      console.log(`  ${m.full_name} (ID: ${m.member_id}) - Qualified: ${m.is_qualified}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkMatrixTree(4846, 'no_stage');
