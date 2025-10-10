const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function generateTestReferrals() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get referrer info
    const referrerResult = await client.query(
      'SELECT id, referral_code, mlm_level FROM users WHERE email = $1',
      ['chinuaodi@gmail.com']
    );
    
    if (referrerResult.rows.length === 0) {
      console.log('❌ User chinuaodi@gmail.com not found');
      return;
    }
    
    const referrer = referrerResult.rows[0];
    console.log(`✅ Found referrer: ${referrer.referral_code}, Current level: ${referrer.mlm_level}`);
    
    // Generate 6 referrals
    const referrals = [];
    for (let i = 1; i <= 6; i++) {
      const email = `testreferral${i}_${Date.now()}@test.com`;
      const password = await bcrypt.hash('Test@123', 10);
      const referralCode = `TEST${Date.now()}${i}`;
      
      // Create user
      const userResult = await client.query(
        `INSERT INTO users (full_name, email, password, phone, referral_code, referred_by, mlm_level, joining_fee_paid, country)
         VALUES ($1, $2, $3, $4, $5, $6, 'no_stage', true, 'NG') RETURNING id`,
        [`Test Referral ${i}`, email, password, `+23480${10000000 + i}`, referralCode, referrer.referral_code]
      );
      
      const userId = userResult.rows[0].id;
      
      // Create wallet with 18k+ balance
      await client.query(
        'INSERT INTO wallets (user_id, balance, total_earned) VALUES ($1, $2, $3)',
        [userId, 18000, 18000]
      );
      
      // Create user profile
      await client.query(
        'INSERT INTO user_profiles (user_id) VALUES ($1)',
        [userId]
      );
      
      // Create approved deposit request
      await client.query(
        `INSERT INTO deposit_requests (user_id, amount, payment_method, status)
         VALUES ($1, 18000, 'bank_transfer', 'approved')`,
        [userId]
      );
      
      // Process referral bonus using mlmService
      const mlmService = require('./src/services/mlmService');
      await mlmService.processReferral(referrer.id, userId);
      
      referrals.push({ id: userId, email });
      console.log(`✅ Created referral ${i}: ${email}`);
    }
    
    await client.query('COMMIT');
    
    // Check updated referrer level
    const updatedReferrer = await client.query(
      'SELECT mlm_level FROM users WHERE id = $1',
      [referrer.id]
    );
    
    console.log('\n📊 RESULTS:');
    console.log(`Referrer new level: ${updatedReferrer.rows[0].mlm_level}`);
    console.log(`Total referrals created: ${referrals.length}`);
    
    // Check earnings
    const earnings = await client.query(
      'SELECT SUM(amount) as total FROM referral_earnings WHERE user_id = $1',
      [referrer.id]
    );
    console.log(`Total MLM earnings: $${earnings.rows[0].total || 0} USD`);
    
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

generateTestReferrals();
