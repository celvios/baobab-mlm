const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testSpilloverSystem() {
  console.log('\n========================================');
  console.log('Testing Spillover System');
  console.log('========================================\n');

  try {
    // 1. Check if spillover_referrals table exists
    console.log('[1/5] Checking database schema...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'spillover_referrals'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ spillover_referrals table exists');
    } else {
      console.log('❌ spillover_referrals table NOT found');
      console.log('   Run: node apply-spillover-migration.js');
      return;
    }

    // 2. Check for spillover records
    console.log('\n[2/5] Checking for spillover records...');
    const spilloverCount = await pool.query('SELECT COUNT(*) FROM spillover_referrals');
    console.log(`   Found ${spilloverCount.rows[0].count} spillover record(s)`);

    // 3. Check for spillover notifications
    console.log('\n[3/5] Checking for spillover notifications...');
    const notificationCount = await pool.query(`
      SELECT COUNT(*) FROM market_updates 
      WHERE title = 'New Spillover Member!'
    `);
    console.log(`   Found ${notificationCount.rows[0].count} spillover notification(s)`);

    // 4. Display recent spillover records
    if (parseInt(spilloverCount.rows[0].count) > 0) {
      console.log('\n[4/5] Recent spillover records:');
      const recentSpillovers = await pool.query(`
        SELECT 
          sr.id,
          ref.full_name as original_referrer,
          parent.full_name as placement_parent,
          member.full_name as spillover_member,
          sr.stage,
          sr.created_at
        FROM spillover_referrals sr
        JOIN users ref ON sr.original_referrer_id = ref.id
        JOIN users parent ON sr.placement_parent_id = parent.id
        JOIN users member ON sr.referred_user_id = member.id
        ORDER BY sr.created_at DESC
        LIMIT 5
      `);

      recentSpillovers.rows.forEach((record, index) => {
        console.log(`\n   ${index + 1}. ${record.spillover_member}`);
        console.log(`      Original Referrer: ${record.original_referrer}`);
        console.log(`      Placed Under: ${record.placement_parent}`);
        console.log(`      Stage: ${record.stage}`);
        console.log(`      Date: ${new Date(record.created_at).toLocaleString()}`);
      });
    } else {
      console.log('\n[4/5] No spillover records yet');
      console.log('   Create 3+ referrals with the same code to test');
    }

    // 5. Test email service configuration
    console.log('\n[5/5] Checking email configuration...');
    if (process.env.SENDGRID_API_KEY) {
      console.log('✅ SendGrid API key is configured');
    } else {
      console.log('⚠️  SendGrid API key NOT configured');
      console.log('   Emails will not be sent');
    }

    if (process.env.FROM_EMAIL) {
      console.log(`✅ From email: ${process.env.FROM_EMAIL}`);
    } else {
      console.log('⚠️  FROM_EMAIL not configured');
    }

    // Summary
    console.log('\n========================================');
    console.log('Test Summary');
    console.log('========================================');
    console.log(`Database Schema: ${tableCheck.rows[0].exists ? '✅' : '❌'}`);
    console.log(`Spillover Records: ${spilloverCount.rows[0].count}`);
    console.log(`Notifications: ${notificationCount.rows[0].count}`);
    console.log(`Email Config: ${process.env.SENDGRID_API_KEY ? '✅' : '⚠️'}`);
    console.log('========================================\n');

    // Next steps
    if (parseInt(spilloverCount.rows[0].count) === 0) {
      console.log('📝 Next Steps:');
      console.log('1. Create a test user');
      console.log('2. Register 3+ people with their referral code');
      console.log('3. Check that 3rd person triggers spillover');
      console.log('4. Verify email and dashboard notifications\n');
    } else {
      console.log('✅ Spillover system is working!\n');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testSpilloverSystem();
