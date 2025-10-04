const pool = require('./src/config/database');

async function fixUserRecords() {
  const client = await pool.connect();
  try {
    console.log('Starting user records fix...\n');
    
    // Get all users without wallets
    const usersWithoutWallets = await client.query(`
      SELECT u.id, u.email, u.full_name
      FROM users u 
      LEFT JOIN wallets w ON u.id = w.user_id 
      WHERE w.id IS NULL
    `);
    
    console.log(`Found ${usersWithoutWallets.rows.length} users without wallets`);
    
    // Create wallets for them
    for (const user of usersWithoutWallets.rows) {
      await client.query(
        'INSERT INTO wallets (user_id, balance, total_earned, total_withdrawn) VALUES ($1, 0, 0, 0)',
        [user.id]
      );
      console.log(`✓ Created wallet for: ${user.full_name} (${user.email})`);
    }
    
    console.log('');
    
    // Get all users without profiles
    const usersWithoutProfiles = await client.query(`
      SELECT u.id, u.email, u.full_name
      FROM users u 
      LEFT JOIN user_profiles up ON u.id = up.user_id 
      WHERE up.id IS NULL
    `);
    
    console.log(`Found ${usersWithoutProfiles.rows.length} users without profiles`);
    
    // Create profiles for them
    for (const user of usersWithoutProfiles.rows) {
      await client.query(
        'INSERT INTO user_profiles (user_id) VALUES ($1)',
        [user.id]
      );
      console.log(`✓ Created profile for: ${user.full_name} (${user.email})`);
    }
    
    console.log('\n=================================');
    console.log('All user records fixed successfully!');
    console.log('=================================\n');
    
    // Show summary
    const summary = await client.query(`
      SELECT 
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT w.id) as users_with_wallets,
        COUNT(DISTINCT up.id) as users_with_profiles
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      LEFT JOIN user_profiles up ON u.id = up.user_id
    `);
    
    console.log('Summary:');
    console.log(`Total Users: ${summary.rows[0].total_users}`);
    console.log(`Users with Wallets: ${summary.rows[0].users_with_wallets}`);
    console.log(`Users with Profiles: ${summary.rows[0].users_with_profiles}`);
    
  } catch (error) {
    console.error('Error fixing user records:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

fixUserRecords();
