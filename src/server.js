const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const initDatabase = require('./config/initDatabase');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const withdrawalRoutes = require('./routes/withdrawal');
const marketUpdatesRoutes = require('./routes/marketUpdates');
const mlmRoutes = require('./routes/mlm');
const ordersRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const productsRoutes = require('./routes/products');
const exchangeRateRoutes = require('./routes/exchangeRate');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://baobab-frontend.vercel.app', 'https://baobab-mlm.vercel.app']
    : ['http://localhost:3000', 'http://localhost:3002', 'http://192.168.1.84:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files for payment proofs
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/withdrawal', withdrawalRoutes);
app.use('/api/market-updates', marketUpdatesRoutes);
app.use('/api/mlm', mlmRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/bank', require('./routes/bank'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/admin', adminRoutes);
app.use('/api/exchange-rate', exchangeRateRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Baobab MLM API is running', timestamp: new Date().toISOString() });
});

// Fix database tables
app.get('/api/fix-db', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  try {
    const client = await pool.connect();
    
    // Create user_profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) UNIQUE,
        delivery_address TEXT,
        bank_name VARCHAR(255),
        account_number VARCHAR(20),
        account_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create market_updates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS market_updates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add missing columns to users table
    try {
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE');
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255)');
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP');
    } catch (e) {
      console.log('Some columns may already exist');
    }
    
    client.release();
    res.json({ message: 'Database tables fixed successfully!', success: true });
  } catch (error) {
    console.error('Database fix error:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Check database tables
app.get('/api/check-tables', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  try {
    const client = await pool.connect();
    
    // Check what tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    client.release();
    res.json({ 
      success: true, 
      tables: result.rows.map(row => row.table_name),
      count: result.rows.length
    });
  } catch (error) {
    console.error('Check tables error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test user profile without auth
app.get('/api/test-profile', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  try {
    const client = await pool.connect();
    
    // Get first user for testing
    const result = await client.query('SELECT * FROM users LIMIT 1');
    
    if (result.rows.length === 0) {
      return res.json({ message: 'No users found' });
    }
    
    const user = result.rows[0];
    client.release();
    
    res.json({
      message: 'User found',
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        referralCode: user.referral_code
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test auth route
app.get('/api/auth/test', (req, res) => {
  res.json({ message: 'Auth route working' });
});

// Create missing user records
app.get('/api/create-user-records', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  try {
    const client = await pool.connect();
    
    // Get all users
    const users = await client.query('SELECT id FROM users');
    let created = 0;
    
    for (const user of users.rows) {
      // Check if profile exists
      const profileExists = await client.query('SELECT id FROM user_profiles WHERE user_id = $1', [user.id]);
      if (profileExists.rows.length === 0) {
        await client.query('INSERT INTO user_profiles (user_id) VALUES ($1)', [user.id]);
        created++;
      }
      
      // Check if wallet exists
      const walletExists = await client.query('SELECT id FROM wallets WHERE user_id = $1', [user.id]);
      if (walletExists.rows.length === 0) {
        await client.query('INSERT INTO wallets (user_id, balance, total_earned, total_withdrawn) VALUES ($1, 0, 0, 0)', [user.id]);
        created++;
      }
    }
    
    client.release();
    res.json({ message: `Created ${created} missing records for ${users.rows.length} users` });
  } catch (error) {
    console.error('Create user records error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Exchange rate migration endpoint
app.get('/api/run-exchange-rate-migration', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  try {
    const client = await pool.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS exchange_rates (
        id SERIAL PRIMARY KEY,
        currency_code VARCHAR(3) NOT NULL UNIQUE,
        rate DECIMAL(10, 4) NOT NULL,
        updated_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query(`
      INSERT INTO exchange_rates (currency_code, rate) 
      VALUES ('NGN', 1500.00)
      ON CONFLICT (currency_code) DO NOTHING
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency 
      ON exchange_rates(currency_code)
    `);
    
    client.release();
    res.json({ 
      success: true,
      message: 'Exchange rate migration completed successfully!',
      defaultRate: 1500
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test email endpoint with your actual email
app.get('/api/test-email/:email', async (req, res) => {
  try {
    const { sendOTPEmail } = require('./utils/emailService');
    const testOTP = '123456';
    await sendOTPEmail(req.params.email, testOTP, 'Test User');
    res.json({ message: `Test OTP ${testOTP} sent to ${req.params.email}` });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Setup admin user
app.get('/api/setup-admin', async (req, res) => {
  try {
    const createAdmin = require('./scripts/createAdmin');
    await createAdmin();
    res.json({ message: 'Admin setup completed successfully!' });
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Initialize new features database tables
app.get('/api/init-new-features', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  try {
    const client = await pool.connect();
    
    // Create admin_activity_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_activity_logs (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER,
          action VARCHAR(100) NOT NULL,
          details TEXT,
          user_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create email_history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_history (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER,
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          recipient_category VARCHAR(50) DEFAULT 'all',
          recipient_count INTEGER DEFAULT 0,
          sent_count INTEGER DEFAULT 0,
          failed_count INTEGER DEFAULT 0,
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add missing columns to transactions table
    await client.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS admin_id INTEGER`);
    await client.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reference VARCHAR(100)`);
    
    // Add missing columns to wallets table
    await client.query(`ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_earned DECIMAL(10,2) DEFAULT 0`);
    await client.query(`ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_withdrawn DECIMAL(10,2) DEFAULT 0`);
    await client.query(`ALTER TABLE wallets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    
    // Add missing columns to withdrawal_requests table
    await client.query(`ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT`);
    await client.query(`ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS admin_id INTEGER`);
    await client.query(`ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP`);
    
    client.release();
    res.json({ 
      success: true,
      message: 'New features database tables initialized successfully!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('New features init error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Fix database tables
app.get('/api/fix-database', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  try {
    const client = await pool.connect();
    
    // Create user_profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) UNIQUE,
        delivery_address TEXT,
        bank_name VARCHAR(255),
        account_number VARCHAR(20),
        account_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create market_updates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS market_updates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add missing columns to users table
    try {
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE');
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255)');
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP');
    } catch (e) {
      console.log('Some columns may already exist');
    }
    
    // Add type column to payment_confirmations if table exists
    try {
      await client.query('ALTER TABLE payment_confirmations ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT \'joining_fee\'');
    } catch (e) {
      console.log('payment_confirmations table may not exist yet');
    }
    
    client.release();
    res.json({ message: 'Database tables fixed successfully!' });
  } catch (error) {
    console.error('Database fix error:', error);
    res.status(500).json({ error: error.message });
  }
});



// Reset database tables
app.get('/api/reset-database', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  try {
    const client = await pool.connect();
    
    // Drop existing tables in correct order
    await client.query('DROP TABLE IF EXISTS orders CASCADE');
    await client.query('DROP TABLE IF EXISTS market_updates CASCADE');
    await client.query('DROP TABLE IF EXISTS mlm_matrix CASCADE');
    await client.query('DROP TABLE IF EXISTS level_progressions CASCADE');
    await client.query('DROP TABLE IF EXISTS referral_earnings CASCADE');
    await client.query('DROP TABLE IF EXISTS transactions CASCADE');
    await client.query('DROP TABLE IF EXISTS user_profiles CASCADE');
    await client.query('DROP TABLE IF EXISTS wallets CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    
    client.release();
    res.json({ message: 'Database tables dropped successfully!' });
  } catch (error) {
    console.error('Database reset error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Setup database tables
app.get('/api/setup-database', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  try {
    const client = await pool.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        referral_code VARCHAR(50) UNIQUE,
        referred_by VARCHAR(50),
        mlm_level VARCHAR(20) DEFAULT 'no_stage',
        is_email_verified BOOLEAN DEFAULT FALSE,
        email_verification_token VARCHAR(255),
        email_verification_expires TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        registration_fee_paid BOOLEAN DEFAULT FALSE,
        product_purchase_paid BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create user_profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        delivery_address TEXT,
        bank_name VARCHAR(255),
        account_number VARCHAR(20),
        account_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        reference VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create referral_earnings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS referral_earnings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        referred_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        level VARCHAR(20) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create level_progressions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS level_progressions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        from_level VARCHAR(20),
        to_level VARCHAR(20) NOT NULL,
        referrals_count INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create mlm_matrix table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mlm_matrix (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        level VARCHAR(20) NOT NULL,
        position INTEGER NOT NULL,
        parent_id INTEGER REFERENCES users(id),
        left_child_id INTEGER REFERENCES users(id),
        right_child_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create market_updates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS market_updates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'info',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create wallets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        balance DECIMAL(10,2) DEFAULT 0,
        total_earned DECIMAL(10,2) DEFAULT 0,
        total_withdrawn DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        stock INTEGER DEFAULT 0,
        image_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_price DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        total_amount DECIMAL(10,2) NOT NULL,
        delivery_type VARCHAR(50) DEFAULT 'pickup',
        delivery_address TEXT,
        pickup_station VARCHAR(255),
        payment_status VARCHAR(20) DEFAULT 'pending',
        order_status VARCHAR(20) DEFAULT 'pending',
        payment_reference VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes for orders table
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status)`);
    
    // Create withdrawal_requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS withdrawal_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create payment_confirmations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_confirmations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        type VARCHAR(50) DEFAULT 'joining_fee',
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Check if tables were actually created
    const checkResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    client.release();
    res.json({ 
      message: 'Database tables created successfully!', 
      tables_created: checkResult.rows.map(row => row.table_name),
      count: checkResult.rows.length
    });
  } catch (error) {
    console.error('Database setup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on port ${PORT}`);
  // Initialize database tables on startup
  await initDatabase();
});