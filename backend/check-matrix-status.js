const pool = require('./src/config/database');

async function checkMatrixStatus() {
  const client = await pool.connect();
  try {
    console.log('Checking all users matrix status...\n');
    
    const result = await client.query(`
      SELECT 
        u.id, 
        u.full_name, 
        u.mlm_level,
        sm.slots_filled,
        sm.qualified_slots_filled,
        sm.slots_required,
        sm.is_complete,
        CASE 
          WHEN sm.qualified_slots_filled >= sm.slots_required THEN 'READY TO UPGRADE'
          ELSE 'IN PROGRESS'
        END as status
      FROM users u
      LEFT JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = u.mlm_level
      WHERE u.mlm_level IS NOT NULL
      ORDER BY u.mlm_level, u.id
    `);

    console.log(`Total users: ${result.rows.length}\n`);

    const grouped = {};
    result.rows.forEach(user => {
      const stage = user.mlm_level || 'no_stage';
      if (!grouped[stage]) grouped[stage] = [];
      grouped[stage].push(user);
    });

    Object.keys(grouped).forEach(stage => {
      console.log(`\n=== ${stage.toUpperCase()} ===`);
      grouped[stage].forEach(user => {
        console.log(`${user.full_name} (ID: ${user.id})`);
        console.log(`  Slots: ${user.qualified_slots_filled || 0}/${user.slots_required || 0}`);
        console.log(`  Complete: ${user.is_complete ? 'YES' : 'NO'}`);
        console.log(`  Status: ${user.status}`);
      });
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkMatrixStatus();
