const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const setupAdmin = async () => {
  try {
    console.log('🚀 Setting up Baobab Admin System...\n');

    // 1. Setup database tables
    console.log('1. Setting up database tables...');
    const dbResponse = await axios.get(`${BASE_URL}/setup-database`);
    console.log('✅', dbResponse.data.message);

    // 2. Setup admin user
    console.log('\n2. Creating admin user...');
    const adminResponse = await axios.get(`${BASE_URL}/setup-admin`);
    console.log('✅', adminResponse.data.message);

    console.log('\n🎉 Admin setup complete!');
    console.log('\n📋 Admin Credentials:');
    console.log('Email: admin@baobabmlm.com');
    console.log('Password: Baobab2025@');
    console.log('\n🌐 Access admin panel at: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Setup failed:', error.response?.data || error.message);
  }
};

setupAdmin();