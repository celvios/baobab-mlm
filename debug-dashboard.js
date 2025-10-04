const pool = require('./src/config/database');

async function debugDashboard() {
  try {
    console.log('=== DEBUGGING DASHBOARD DATA ===\n');
    
    // Check users table
    const allUsers = await pool.query('SELECT COUNT(*) as total FROM users');
    const activeUsers = await pool.query('SELECT COUNT(*) as total FROM users WHERE is_active = true');
    const inactiveUsers = await pool.query('SELECT COUNT(*) as total FROM users WHERE is_active = false OR is_active IS NULL');
    
    console.log('USERS:');
    console.log(`Total users: ${allUsers.rows[0].total}`);
    console.log(`Active users: ${activeUsers.rows[0].total}`);
    console.log(`Inactive/NULL users: ${inactiveUsers.rows[0].total}`);
    
    // Check products table
    const allProducts = await pool.query('SELECT COUNT(*) as total FROM products');
    const activeProducts = await pool.query('SELECT COUNT(*) as total FROM products WHERE is_active = true');
    const inactiveProducts = await pool.query('SELECT COUNT(*) as total FROM products WHERE is_active = false OR is_active IS NULL');
    
    console.log('\nPRODUCTS:');
    console.log(`Total products: ${allProducts.rows[0].total}`);
    console.log(`Active products: ${activeProducts.rows[0].total}`);
    console.log(`Inactive/NULL products: ${inactiveProducts.rows[0].total}`);
    
    // Check orders table
    const allOrders = await pool.query('SELECT COUNT(*) as total FROM orders');
    console.log('\nORDERS:');
    console.log(`Total orders: ${allOrders.rows[0].total}`);
    
    // Sample data from each table
    const sampleUsers = await pool.query('SELECT id, full_name, email, is_active FROM users LIMIT 3');
    const sampleProducts = await pool.query('SELECT id, name, price, is_active FROM products LIMIT 3');
    
    console.log('\nSAMPLE USERS:');
    console.log(sampleUsers.rows);
    
    console.log('\nSAMPLE PRODUCTS:');
    console.log(sampleProducts.rows);
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    process.exit(0);
  }
}

debugDashboard();