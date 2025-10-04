const https = require('https');

const BACKEND_URL = 'https://baobab-mlm.onrender.com';

function testEndpoint(path, description) {
    return new Promise((resolve) => {
        console.log(`\n🧪 Testing: ${description}`);
        console.log(`📡 URL: ${BACKEND_URL}${path}`);
        
        const startTime = Date.now();
        
        https.get(`${BACKEND_URL}${path}`, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const duration = Date.now() - startTime;
                console.log(`⏱️  Response time: ${duration}ms`);
                console.log(`📊 Status: ${res.statusCode}`);
                
                try {
                    const parsed = JSON.parse(data);
                    console.log(`✅ Response:`, parsed);
                } catch (e) {
                    console.log(`📄 Response:`, data.substring(0, 200));
                }
                
                resolve({ status: res.statusCode, data, duration });
            });
        }).on('error', (err) => {
            const duration = Date.now() - startTime;
            console.log(`❌ Error after ${duration}ms:`, err.message);
            resolve({ error: err.message, duration });
        });
    });
}

async function runTests() {
    console.log('🚀 Testing Deployed Backend...\n');
    
    // Test basic endpoints first
    await testEndpoint('/api/health', 'Health Check');
    await testEndpoint('/api/test', 'Basic Test');
    
    // Test email configuration
    await testEndpoint('/api/verify-email-setup', 'Email Setup Verification');
    
    // Test email sending (replace with your email)
    const testEmail = 'your-email@gmail.com'; // Replace with your email
    await testEndpoint(`/api/test-email/${testEmail}`, 'Email Send Test');
    
    console.log('\n✨ Testing complete!');
}

runTests().catch(console.error);