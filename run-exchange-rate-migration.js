const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting exchange rate migration...');
    
    // Create exchange_rates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS exchange_rates (
        id SERIAL PRIMARY KEY,
        currency_code VARCHAR(3) NOT NULL UNIQUE,
        rate DECIMAL(10, 4) NOT NULL,
        updated_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created exchange_rates table');
    
    // Insert default exchange rate
    await client.query(`
      INSERT INTO exchange_rates (currency_code, rate) 
      VALUES ('NGN', 1500.00)
      ON CONFLICT (currency_code) DO NOTHING
    `);
    console.log('✓ Inserted default NGN exchange rate (1500)');
    
    // Create index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency 
      ON exchange_rates(currency_code)
    `);
    console.log('✓ Created index on currency_code');
    
    console.log('\n✅ Exchange rate migration completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Access the Exchange Rate tab in Admin Settings');
    console.log('2. Update the exchange rate as needed');
    console.log('3. The system will use your custom rate instead of the API\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
