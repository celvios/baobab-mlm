// STEP 1: Change these values
const USER_EMAIL = 'your-email@example.com';  // ← Change this
const REFERRAL_COUNT = 6;                      // ← Change this

// STEP 2: Copy and paste in console
fetch(`https://baobab-backend.onrender.com/api/generate-referrals/${USER_EMAIL}/${REFERRAL_COUNT}`)
  .then(r => r.json())
  .then(d => console.log('✅', d.message, d))
  .catch(e => console.error('❌', e));
