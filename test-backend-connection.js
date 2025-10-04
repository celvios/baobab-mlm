// Test script to verify backend connection
const testUrls = [
  'https://baobab-backend.onrender.com',
  'https://baobab-mlm-backend.onrender.com',
  'https://baobab-backend-api.onrender.com'
];

async function testBackendConnection() {
  console.log('Testing backend connections...\n');
  
  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      
      // Test health endpoint
      const healthResponse = await fetch(`${url}/api/health`);
      if (healthResponse.ok) {
        const data = await healthResponse.json();
        console.log(`✅ SUCCESS: ${url}`);
        console.log(`Response:`, data);
        
        // Test admin setup endpoint
        try {
          const setupResponse = await fetch(`${url}/api/admin/auth/setup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'test@test.com',
              password: 'test123',
              fullName: 'Test Admin'
            })
          });
          
          if (setupResponse.ok || setupResponse.status === 400) {
            console.log(`✅ Admin setup endpoint is working`);
          }
        } catch (e) {
          console.log(`❌ Admin setup endpoint error:`, e.message);
        }
        
        console.log('\n');
        return url; // Return the working URL
      }
    } catch (error) {
      console.log(`❌ FAILED: ${url} - ${error.message}`);
    }
    console.log('');
  }
  
  console.log('❌ No working backend URL found');
  return null;
}

// Run the test
testBackendConnection().then(workingUrl => {
  if (workingUrl) {
    console.log(`\n🎉 Use this URL in your frontend: ${workingUrl}`);
  } else {
    console.log('\n💡 Your backend might be sleeping on Render. Try visiting the URL in your browser first to wake it up.');
  }
});