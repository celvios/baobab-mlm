const pool = require('./src/config/database');

async function fixFeederSlots() {
  const client = await pool.connect();
  try {
    console.log('Updating feeder stage to require 14 slots...\n');
    
    const result = await client.query(`
      UPDATE stage_matrix 
      SET slots_required = 14 
      WHERE stage = 'feeder' AND slots_required = 6
      RETURNING user_id
    `);

    console.log(`✓ Updated ${result.rowCount} feeder stage matrices to require 14 slots`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixFeederSlots();
