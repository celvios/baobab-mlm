require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const USER_EMAIL = 'forquant002@gmail.com';
const REFERRAL_COUNT = 6;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function generateReferrals() {
  const client = await pool.connect();
  
  try {
    // Get user
    const userResult = await client.query('SELECT * FROM users WHERE email = $1', [USER_EMAIL]);
    if (userResult.rows.length === 0) {
      console.error('❌ User not found');
      return;
    }
    
    const user = userResult.rows[0];
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    const createdReferrals = [];
    
    for (let i = 1; i <= REFERRAL_COUNT; i++) {
      const refEmail = `ref_${Date.now()}_${i}@test.com`;
      
      // Create referral user
      const newUser = await client.query(
        `INSERT INTO users (full_name, email, phone, password, referred_by, dashboard_unlocked, deposit_confirmed)
         VALUES ($1, $2, $3, $4, $5, TRUE, TRUE)
         RETURNING id, email`,
        [`Referral ${i}`, refEmail, `+234${Math.floor(Math.random() * 1000000000)}`, hashedPassword, user.referral_code]
      );
      
      const newUserId = newUser.rows[0].id;
      
      // Create wallet
      await client.query('INSERT INTO wallets (user_id, balance) VALUES ($1, 0)', [newUserId]);
      
      // Create approved deposit
      await client.query(
        'INSERT INTO deposit_requests (user_id, amount, status) VALUES ($1, 18000, $2)',
        [newUserId, 'approved']
      );
      
      createdReferrals.push(newUser.rows[0]);
      console.log(`✅ Created: ${newUser.rows[0].email}`);
    }
    
    // Process MLM for each referral
    const mlmService = require('./src/services/mlmService');
    for (const ref of createdReferrals) {
      try {
        await mlmService.processReferral(user.id, ref.id);
        console.log(`💰 Processed MLM for ${ref.email}`);
      } catch (err) {
        console.log(`⚠️  MLM processing error: ${err.message}`);
      }
    }
    
    console.log(`\n✅ SUCCESS: Created ${REFERRAL_COUNT} paid referrals for ${USER_EMAIL}`);
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

generateReferrals();
