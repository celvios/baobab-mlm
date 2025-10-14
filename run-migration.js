const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://baobab_user:S5h2NLhhFOMHWTJGaISiyRNDkMCjkTmM@dpg-d329lo3ipnbc73d1996g-a.oregon-postgres.render.com/baobab_1khs',
  ssl: { rejectUnauthorized: true }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to database!');
    
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS deposit_confirmed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deposit_confirmed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS dashboard_unlocked BOOLEAN DEFAULT FALSE
    `);
    console.log('✓ Added columns');
    
    await client.query(`ALTER TABLE users ALTER COLUMN mlm_level SET DEFAULT 'no_stage'`);
    console.log('✓ Set default mlm_level');
    
    await client.query(`
      UPDATE users 
      SET dashboard_unlocked = FALSE, 
          deposit_confirmed = FALSE, 
          mlm_level = 'no_stage'
    `);
    console.log('✓ Updated existing users');
    
    const result = await client.query(`
      SELECT id, email, mlm_level, dashboard_unlocked 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('\n✅ Migration complete! Latest users:');
    console.table(result.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

runMigration();
