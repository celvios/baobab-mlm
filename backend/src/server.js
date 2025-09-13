const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const withdrawalRoutes = require('./routes/withdrawal');
const marketUpdatesRoutes = require('./routes/marketUpdates');
const mlmRoutes = require('./routes/mlm');

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
app.use('/api/bank', require('./routes/bank'));

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

// Simple register route for testing
app.post('/api/auth/register', async (req, res) => {
  try {
    res.json({ message: 'Register endpoint working', body: req.body });
  } catch (error) {
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
        password_hash VARCHAR(255) NOT NULL,
        referral_code VARCHAR(50) UNIQUE,
        referred_by VARCHAR(50),
        mlm_level VARCHAR(20) DEFAULT 'no_stage',
        email_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create wallets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        balance DECIMAL(10,2) DEFAULT 0,
        total_earned DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
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