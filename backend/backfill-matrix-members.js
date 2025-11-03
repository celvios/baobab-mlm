const pool = require('./src/config/database');

async function backfillMatrixMembers() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('Backfilling missing matrix members...\n');

    // For user 4846, add the 4 grandchildren
    const missingMembers = [
      { ownerId: 4846, memberId: 4849, stage: 'no_stage' },
      { ownerId: 4846, memberId: 4850, stage: 'no_stage' },
      { ownerId: 4846, memberId: 4851, stage: 'no_stage' },
      { ownerId: 4846, memberId: 4852, stage: 'no_stage' }
    ];

    for (const { ownerId, memberId, stage } of missingMembers) {
      // Add to stage_matrix_members
      await client.query(`
        INSERT INTO stage_matrix_members (matrix_owner_id, matrix_stage, member_id, member_stage_at_placement, is_qualified, qualified_at)
        VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP)
        ON CONFLICT (matrix_owner_id, matrix_stage, member_id) DO NOTHING
      `, [ownerId, stage, memberId, stage]);

      // Update counts
      await client.query(`
        UPDATE stage_matrix 
        SET slots_filled = slots_filled + 1, 
            qualified_slots_filled = qualified_slots_filled + 1
        WHERE user_id = $1 AND stage = $2
      `, [ownerId, stage]);

      console.log(`✓ Added member ${memberId} to user ${ownerId}'s matrix`);
    }

    // Check if user should be upgraded
    const mlmService = require('./src/services/mlmService');
    await mlmService.checkLevelProgression(client, 4846);

    await client.query('COMMIT');
    console.log('\n✓ Backfill complete!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

backfillMatrixMembers();
