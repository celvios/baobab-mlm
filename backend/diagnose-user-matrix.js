const pool = require('./src/config/database');

async function diagnoseUserMatrix(userId) {
  const client = await pool.connect();
  try {
    // Get user info
    const userInfo = await client.query(`
      SELECT id, full_name, mlm_level FROM users WHERE id = $1
    `, [userId]);

    if (userInfo.rows.length === 0) {
      console.log('User not found');
      return;
    }

    const user = userInfo.rows[0];
    console.log(`\n=== ${user.full_name} (ID: ${user.id}) ===`);
    console.log(`Current Stage: ${user.mlm_level}\n`);

    // Get stage matrix info
    const stageMatrix = await client.query(`
      SELECT * FROM stage_matrix WHERE user_id = $1 AND stage = $2
    `, [userId, user.mlm_level]);

    if (stageMatrix.rows.length > 0) {
      const sm = stageMatrix.rows[0];
      console.log('Matrix Status:');
      console.log(`  Total Slots Filled: ${sm.slots_filled}/${sm.slots_required}`);
      console.log(`  Qualified Slots: ${sm.qualified_slots_filled}/${sm.slots_required}`);
      console.log(`  Complete: ${sm.is_complete ? 'YES' : 'NO'}\n`);
    }

    // Get all members in this user's matrix
    const members = await client.query(`
      SELECT 
        smm.member_id,
        u.full_name,
        u.mlm_level as current_stage,
        smm.member_stage_at_placement,
        smm.is_qualified,
        smm.qualified_at
      FROM stage_matrix_members smm
      JOIN users u ON smm.member_id = u.id
      WHERE smm.matrix_owner_id = $1 AND smm.matrix_stage = $2
      ORDER BY smm.created_at
    `, [userId, user.mlm_level]);

    console.log(`Members in ${user.mlm_level} matrix (${members.rows.length} total):`);
    members.rows.forEach((member, idx) => {
      console.log(`\n  ${idx + 1}. ${member.full_name} (ID: ${member.member_id})`);
      console.log(`     Current stage: ${member.current_stage}`);
      console.log(`     Stage at placement: ${member.member_stage_at_placement}`);
      console.log(`     Qualified: ${member.is_qualified ? '✓ YES' : '✗ NO'}`);
      if (!member.is_qualified) {
        console.log(`     Reason: Needs to complete previous stage first`);
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

const userId = process.argv[2];
if (!userId) {
  console.log('Usage: node diagnose-user-matrix.js <user_id>');
  process.exit(1);
}

diagnoseUserMatrix(parseInt(userId));
