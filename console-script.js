// STEP 1: Change these values
const USER_EMAIL = 'your-email@example.com';           // ← Change this to your email
const REFERRAL_COUNT = 6;                               // ← Change this to number of referrals

// STEP 2: Copy everything and paste in console
(async function() {
  console.log(`🚀 Generating ${REFERRAL_COUNT} referrals for ${USER_EMAIL}...`);
  
  const response = await fetch(`https://baobab-backend.onrender.com/api/generate-referrals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: USER_EMAIL, count: REFERRAL_COUNT })
  });
  
  const result = await response.json();
  
  if (response.ok) {
    console.log(`✅ Success:`, result.message);
    console.log(`Created referrals:`, result.referrals);
  } else {
    console.error(`❌ Failed:`, result.error);
  }
})();
