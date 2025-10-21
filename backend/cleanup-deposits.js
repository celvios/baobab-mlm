require('dotenv').config();
const pool = require('./src/config/database');

async function cleanupDuplicateDeposits() {
  const client = await pool.connect();
  
  try {
    console.log('Starting cleanup of duplicate deposits...\n');
    
    // Show duplicates before cleanup
    console.log('Finding duplicate deposits...');
    const duplicates = await client.query(`
      SELECT user_id, COUNT(*) as deposit_count
      FROM deposit_requests
      GROUP BY user_id
      HAVING COUNT(*) > 1
    `);
    
    if (duplicates.rows.length === 0) {
      console.log('No duplicate deposits found!');
      return;
    }
    
    console.log(`Found ${duplicates.rows.length} users with duplicate deposits:`);
    duplicates.rows.forEach(row => {
      console.log(`  User ID ${row.user_id}: ${row.deposit_count} deposits`);
    });
    
    console.log('\nDeleting duplicate deposits (keeping first deposit per user)...');
    
    await client.query('BEGIN');
    
    const result = await client.query(`
      DELETE FROM deposit_requests 
      WHERE id NOT IN (
        SELECT MIN(id) 
        FROM deposit_requests 
        GROUP BY user_id
      )
    `);
    
    console.log(`Deleted ${result.rowCount} duplicate deposits`);
    
    // Add unique constraint
    console.log('\nAdding unique constraint to prevent future duplicates...');
    try {
      await client.query(`
        ALTER TABLE deposit_requests 
        ADD CONSTRAINT unique_user_deposit 
        UNIQUE (user_id)
      `);
      console.log('Unique constraint added successfully');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('Unique constraint already exists');
      } else {
        throw error;
      }
    }
    
    await client.query('COMMIT');
    
    // Verify cleanup
    const remaining = await client.query(`
      SELECT user_id, COUNT(*) as deposit_count
      FROM deposit_requests
      GROUP BY user_id
      HAVING COUNT(*) > 1
    `);
    
    if (remaining.rows.length === 0) {
      console.log('\n✅ Cleanup successful! No duplicate deposits remaining.');
    } else {
      console.log('\n⚠️ Warning: Some duplicates still exist');
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during cleanup:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanupDuplicateDeposits();
