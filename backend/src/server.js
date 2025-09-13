const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const withdrawalRoutes = require('./routes/withdrawal');
const marketUpdatesRoutes = require('./routes/marketUpdates');
const mlmRoutes = require('./routes/mlm');
const ordersRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://baobab-frontend.vercel.app']
    : ['http://localhost:3000', 'http://localhost:3002', 'http://192.168.1.84:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/withdrawal', withdrawalRoutes);
app.use('/api/market-updates', marketUpdatesRoutes);
app.use('/api/mlm', mlmRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/bank', require('./routes/bank'));
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Baobab MLM API is running', timestamp: new Date().toISOString() });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Test auth route
app.get('/api/auth/test', (req, res) => {
  res.json({ message: 'Auth route working' });
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
    
    client.release();
    res.json({ message: 'Database tables created successfully!' });
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});