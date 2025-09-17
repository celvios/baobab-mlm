const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testAdmin = async () => {
  try {
    console.log('🚀 Testing Admin Authentication System...\n');

    // 1. Setup admin user
    console.log('1. Setting up admin user...');
    const setupResponse = await axios.get(`${BASE_URL}/setup-admin`);
    console.log('✅', setupResponse.data.message);

    // 2. Test admin login
    console.log('\n2. Testing admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/admin/login`, {
      email: 'admin@baobabmlm.com',
      password: 'Baobab2025@'
    });
    console.log('✅ Admin login successful');
    console.log('Admin:', loginResponse.data.admin);
    
    const token = loginResponse.data.token;

    // 3. Test protected route - dashboard stats
    console.log('\n3. Testing dashboard stats...');
    const statsResponse = await axios.get(`${BASE_URL}/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Dashboard stats retrieved');
    console.log('Stats:', statsResponse.data.stats);

    // 4. Test admin profile
    console.log('\n4. Testing admin profile...');
    const profileResponse = await axios.get(`${BASE_URL}/admin/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Admin profile retrieved');
    console.log('Profile:', profileResponse.data.admin);

    console.log('\n🎉 All admin tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testAdmin();