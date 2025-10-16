// CONSOLE SCRIPT - Copy and paste this entire script into your browser console

async function generateReferrals(email, count) {
  const API = 'http://localhost:5000';
  
  console.log(`🚀 Generating ${count} referrals for ${email}...`);
  
  for (let i = 0; i < count; i++) {
    const refData = {
      email: `ref_${Date.now()}_${i}@test.com`,
      password: 'password123',
      fullName: `Referral ${i + 1}`,
      phone: `+234${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      referredBy: email
    };
    
    try {
      const res = await fetch(`${API}/api/auth/register`, {
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
  
  console.log(`✅ Done! Generated ${count} referrals for ${email}`);
}

// USAGE: generateReferrals('your-email@example.com', 6)
