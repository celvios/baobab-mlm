const pool = require('./src/config/database');
const mlmService = require('./src/services/mlmService');

async function completeMatrix(userId) {
  try {
    const userResult = await pool.query('SELECT id, full_name, mlm_level FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      console.log('User not found');
      return;
    }

    const user = userResult.rows[0];
    console.log(`\nCompleting matrix for ${user.full_name} (ID: ${user.id})`);
    console.log(`Current stage: ${user.mlm_level}\n`);

    const result = await mlmService.completeUserMatrix(userId, user.mlm_level);
    
    console.log('✓ Matrix completed successfully!');
    console.log(`  Generated ${result.generatedUsers} users`);
    console.log(`  Direct referrals: ${result.directReferrals}`);
    console.log(`  Spillover referrals: ${result.spilloverReferrals}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

const userId = process.argv[2];
if (!userId) {
  console.log('Usage: node complete-user-matrix.js <user_id>');
  process.exit(1);
}

completeMatrix(parseInt(userId));
