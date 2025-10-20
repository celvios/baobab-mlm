// Run this with: node generate-referrals.js

const USER_EMAIL = 'forquant002@gmail.com';
const REFERRAL_COUNT = 6;

fetch(`https://baobab-mlm.onrender.com/api/generate-referrals/${USER_EMAIL}/${REFERRAL_COUNT}`)
  .then(r => r.json())
  .then(d => {
    if (d.success) {
      console.log('✅ SUCCESS:', d.message);
      console.log('Created referrals:', d.referrals);
      console.log('Total earnings:', d.referrals.length * 1.5, 'USD');
    } else {
      console.error('❌ ERROR:', d.error || d.message);
    }
  })
  .catch(e => console.error('❌ FETCH ERROR:', e.message));
