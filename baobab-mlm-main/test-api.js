const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const ADMIN_TOKEN = 'your-admin-jwt-token'; // Replace with actual token

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${ADMIN_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Test Suite
async function runTests() {
  console.log('🚀 Starting API Tests...\n');

  // 1. Test Dashboard
  try {
    const dashboard = await api.get('/admin/dashboard');
    console.log('✅ Dashboard:', dashboard.data.success ? 'PASS' : 'FAIL');
  } catch (error) {
    console.log('❌ Dashboard: FAIL -', error.message);
  }

  // 2. Test Users Management
  try {
    const users = await api.get('/admin/users');
    console.log('✅ Users List:', users.data.success ? 'PASS' : 'FAIL');
  } catch (error) {
    console.log('❌ Users List: FAIL -', error.message);
  }

  // 3. Test Products
  try {
    const products = await api.get('/admin/products');
    console.log('✅ Products:', products.data.success ? 'PASS' : 'FAIL');
  } catch (error) {
    console.log('❌ Products: FAIL -', error.message);
  }

  // 4. Test Orders
  try {
    const orders = await api.get('/admin/orders');
    console.log('✅ Orders:', orders.data.success ? 'PASS' : 'FAIL');
  } catch (error) {
    console.log('❌ Orders: FAIL -', error.message);
  }

  // 5. Test Reports
  try {
    const reports = await api.get('/admin/reports/sales');
    console.log('✅ Reports:', reports.data.success ? 'PASS' : 'FAIL');
  } catch (error) {
    console.log('❌ Reports: FAIL -', error.message);
  }

  console.log('\n🏁 API Tests Complete');
}

runTests();