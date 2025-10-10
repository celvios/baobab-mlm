const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runPriceConversion() {
  try {
    console.log('Converting product prices from Naira to USD...');
    
    const sql = fs.readFileSync(path.join(__dirname, 'convert-prices-to-usd.sql'), 'utf8');
    await pool.query(sql);
    
    console.log('✅ Price conversion completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error converting prices:', error);
    process.exit(1);
  }
}

runPriceConversion();
