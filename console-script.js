// STEP 1: Change these values
const USER_EMAIL = 'your-email@example.com';           // ← Change this to your email
const REFERRAL_COUNT = 6;                               // ← Change this to number of referrals
const API_URL = 'https://baobab-backend.onrender.com'; // ← Change if using different URL

// STEP 2: Copy everything below and paste in console
(async function() {
  console.log(`🚀 Generating ${REFERRAL_COUNT} referrals for ${USER_EMAIL}...`);
  
  for (let i = 0; i < REFERRAL_COUNT; i++) {
    const refData = {
      email: `ref_${Date.now()}_${i}@test.com`,
      password: 'password123',
      fullName: `Referral ${i + 1}`,
      phone: `+234${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      referredBy: USER_EMAIL
    };
    
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refData)
      });
      
      const result = await res.json();
      
      if (res.ok) {
        console.log(`✅ Referral ${i + 1} created:`, result.email);
      } else {
        console.error(`❌ Referral ${i + 1} failed:`, result.message);
      }
    } catch (err) {
      console.error(`❌ Error creating referral ${i + 1}:`, err.message);
    }
    
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log(`✅ Done! Generated ${REFERRAL_COUNT} referrals for ${USER_EMAIL}`);
})();
