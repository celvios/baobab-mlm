const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const withdrawalRoutes = require('./routes/withdrawal');
const marketUpdatesRoutes = require('./routes/marketUpdates');
const mlmRoutes = require('./routes/mlm');
const ordersRoutes = require('./routes/orders');
const depositRoutes = require('./routes/deposit');
const migrateRoutes = require('./routes/migrate');
const earningsRoutes = require('./routes/earnings');
const cleanupRoutes = require('./routes/cleanup');
const { loginLimiter, apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust proxy for Render
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [/\.vercel\.app$/, 'https://baobabworldwide.com', 'https://www.baobabworldwide.com', 'https://baobab-mlm.vercel.app']
      : ['http://localhost:3000', 'http://localhost:3002', 'http://192.168.1.84:3002'];
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      return allowedOrigin.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// Serve static files for payment proofs
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes with rate limiting
app.use('/api/auth/login', loginLimiter);
app.use('/api/admin/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/withdrawal', withdrawalRoutes);
app.use('/api/market-updates', marketUpdatesRoutes);
app.use('/api/mlm', mlmRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/deposit', depositRoutes);
app.use('/api/migrate', migrateRoutes);
app.use('/api/earnings', earningsRoutes);
app.use('/api/bank', require('./routes/bank'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/admin/auth', require('./routes/adminAuth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/products', require('./routes/products'));
app.use('/api/setup', require('./routes/setup'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Baobab MLM API is running', timestamp: new Date().toISOString() });
});

// Admin setup endpoint
app.post('/api/admin-setup', async (req, res) => {
  const { Pool } = require('pg');
  const bcrypt = require('bcryptjs');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const { email, password, fullName } = req.body;
    const client = await pool.connect();
    
    // Check if admin email already exists
    const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      client.release();
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add role column if it doesn't exist (ignore errors)
    try {
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'`);
    } catch (e) {
      console.log('Role column may already exist or table structure is different');
    }

    // Create admin user
    let result;
    try {
      // Try with role column first
      result = await client.query(
        'INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name',
        [fullName, email, hashedPassword, 'admin']
      );
    } catch (e) {
      // If role column doesn't exist, create without it
      result = await client.query(
        'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING id, email, full_name',
        [fullName, email, hashedPassword]
      );
    }

    client.release();
    res.json({
      message: 'Admin created successfully',
      admin: result.rows[0]
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin stats endpoint
app.get('/api/admin-stats', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const client = await pool.connect();
    
    const [usersResult, ordersResult, revenueResult, withdrawalsResult] = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM users WHERE role != $1', ['admin']),
      client.query('SELECT COUNT(*) as count FROM orders'),
      client.query('SELECT COALESCE(SUM(COALESCE(balance, 0)), 0) + COALESCE(SUM(COALESCE(total_earned, 0)), 0) as total FROM wallets'),
      client.query('SELECT COUNT(*) as count FROM withdrawal_requests WHERE status = $1', ['pending'])
    ]);

    client.release();
    
    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      totalOrders: parseInt(ordersResult.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].total),
      pendingWithdrawals: parseInt(withdrawalsResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Settings endpoint for frontend
app.get('/api/settings', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT key, value FROM settings 
      WHERE key IN ('business_name', 'business_email', 'business_phone', 'business_address', 'bank_name', 'account_number', 'account_name')
    `);
    
    const settings = {};
    result.rows.forEach(setting => {
      settings[setting.key] = setting.value;
    });
    
    client.release();
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// Fix withdrawal_requests table and other missing tables
app.get('/api/fix-withdrawal-table', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const client = await pool.connect();
    
    console.log('Creating admin_users table first...');
    
    // Create admin_users table FIRST (before withdrawal_requests)
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default admin user if not exists
    const adminCheck = await client.query('SELECT COUNT(*) FROM admin_users WHERE email = $1', ['admin@baobabmlm.com']);
    if (parseInt(adminCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO admin_users (name, email, password) 
        VALUES ('Admin User', 'admin@baobabmlm.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
      `);
      console.log('Default admin user created');
    }
    
    console.log('Creating withdrawal_requests table...');
    
    // Create withdrawal_requests table AFTER admin_users
    await client.query(`
      CREATE TABLE IF NOT EXISTS withdrawal_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        admin_notes TEXT,
        processed_at TIMESTAMP,
        processed_by INTEGER REFERENCES admin_users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at)');
    
    // Create settings table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default settings if they don't exist
    const settingsCheck = await client.query('SELECT COUNT(*) FROM settings');
    if (parseInt(settingsCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO settings (key, value) VALUES 
        ('business_name', 'Baobab MLM'),
        ('business_email', 'info@baobabmlm.com'),
        ('business_phone', '+234 123 456 7890'),
        ('business_address', 'Lagos, Nigeria'),
        ('bank_name', 'First Bank'),
        ('account_name', 'Baobab MLM Ltd'),
        ('account_number', '1234567890'),
        ('joining_fee', '18000')
      `);
    }
    
    // Create payment_confirmations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_confirmations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        proof_url VARCHAR(500),
        confirmed_by INTEGER REFERENCES admin_users(id),
        confirmed_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',
        type VARCHAR(50) DEFAULT 'joining_fee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    client.release();
    res.json({ message: 'withdrawal_requests table and other missing tables created successfully!', success: true });
  } catch (error) {
    console.error('Database fix error:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

// Fix database tables
app.get('/api/fix-db', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
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

// Generate paid referrals for testing (GET version for console)
app.get('/api/generate-referrals/:email/:count', cors({ origin: '*' }), async (req, res) => {
  const { email, count } = req.params;
  return generateReferralsLogic(req, res, email, parseInt(count));
});

// Generate paid referrals for testing (POST version)
app.post('/api/generate-referrals', async (req, res) => {
  const { email, count } = req.body;
  return generateReferralsLogic(req, res, email, count);
});

async function generateReferralsLogic(req, res, email, count) {
  const { Pool } = require('pg');
  const bcrypt = require('bcryptjs');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    
    if (!email || !count) {
      return res.status(400).json({ error: 'Email and count are required' });
    }
    
    const client = await pool.connect();
    
    // Get user
    const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    const createdReferrals = [];
    
    for (let i = 1; i <= count; i++) {
      const refEmail = `ref_${Date.now()}_${i}@test.com`;
      
      // Create referral user
      const newUser = await client.query(
        `INSERT INTO users (full_name, email, phone, password, referred_by, dashboard_unlocked, deposit_confirmed)
         VALUES ($1, $2, $3, $4, $5, TRUE, TRUE)
         RETURNING id, email`,
        [`Referral ${i}`, refEmail, `+234${Math.floor(Math.random() * 1000000000)}`, hashedPassword, user.referral_code]
      );
      
      const newUserId = newUser.rows[0].id;
      
      // Create wallet
      await client.query('INSERT INTO wallets (user_id, balance) VALUES ($1, 0)', [newUserId]);
      
      // Create approved deposit
      await client.query(
        'INSERT INTO deposit_requests (user_id, amount, status) VALUES ($1, 18000, $2)',
        [newUserId, 'approved']
      );
      
      createdReferrals.push(newUser.rows[0]);
    }
    
    // Process MLM for each referral
    const mlmService = require('./services/mlmService');
    for (const ref of createdReferrals) {
      try {
        await mlmService.processReferral(user.id, ref.id);
      } catch (err) {
        console.log('MLM processing error:', err.message);
      }
    }
    
    client.release();
    
    res.json({
      success: true,
      message: `Created ${count} paid referrals for ${email}`,
      referrals: createdReferrals
    });
  } catch (error) {
    console.error('Generate referrals error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Unlock dashboard for testing
app.get('/api/unlock-dashboard/:email', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const { email } = req.params;
    const result = await pool.query(
      `UPDATE users 
       SET dashboard_unlocked = TRUE,
           deposit_confirmed = TRUE,
           deposit_confirmed_at = NOW()
       WHERE email = $1
       RETURNING id, email, dashboard_unlocked, deposit_confirmed, mlm_level`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'Dashboard unlocked',
      user: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quick OTP test endpoint
app.get('/api/quick-otp-test/:email', async (req, res) => {
  const timeout = setTimeout(() => {
    res.status(408).json({ error: 'Request timeout - email service taking too long' });
  }, 15000);
  
  try {
    const nodemailer = require('nodemailer');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      clearTimeout(timeout);
      return res.status(500).json({
        error: 'Email credentials not configured',
        EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
        EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Missing'
      });
    }
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000
    });
    
    const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: req.params.email,
      subject: 'Baobab MLM - Test OTP',
      html: `<h2>Test OTP: ${testOTP}</h2><p>Sent from Render at ${new Date().toISOString()}</p>`
    });
    
    clearTimeout(timeout);
    res.json({ success: true, message: `OTP ${testOTP} sent to ${req.params.email}` });
  } catch (error) {
    clearTimeout(timeout);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

// Test user profile without auth
app.get('/api/test-profile', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
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
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
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

// Check email configuration
app.get('/api/check-email-config', (req, res) => {
  const emailConfig = {
    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'NOT SET',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'NOT SET',
    FRONTEND_URL: process.env.FRONTEND_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'development'
  };
  
  res.json({
    message: 'Email Configuration Check',
    config: emailConfig,
    timestamp: new Date().toISOString(),
    note: 'SMTP may be blocked on free hosting - email will work in production with proper SMTP setup'
  });
});

// Verify email credentials without sending
app.get('/api/verify-email-setup', async (req, res) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(400).json({
        success: false,
        error: 'Email credentials missing',
        EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
        EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Missing'
      });
    }
    
    res.json({
      success: true,
      message: 'Email credentials configured correctly',
      config: {
        EMAIL_USER: process.env.EMAIL_USER,
        FRONTEND_URL: process.env.FRONTEND_URL || 'NOT SET'
      },
      note: 'Actual sending may fail due to SMTP port restrictions on free hosting'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test email endpoint with SendGrid
app.get('/api/test-email/:email', async (req, res) => {
  try {
    console.log('Testing SendGrid email for:', req.params.email);
    
    if (!process.env.SENDGRID_API_KEY) {
      return res.status(500).json({
        error: 'SendGrid API key missing',
        instructions: 'Please set SENDGRID_API_KEY in Render dashboard'
      });
    }
    
    const { sendOTPEmail } = require('./utils/sendgridService');
    const testOTP = '123456';
    await sendOTPEmail(req.params.email, testOTP, 'Test User');
    res.json({ 
      success: true,
      message: `Test OTP ${testOTP} sent to ${req.params.email} via SendGrid` 
    });
  } catch (error) {
    console.error('SendGrid test error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      code: error.code 
    });
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

// Fix market_updates table
app.get('/api/fix-market-updates', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const client = await pool.connect();
    
    // Add is_read column if it doesn't exist
    await client.query(`
      ALTER TABLE market_updates ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE
    `);
    
    client.release();
    res.json({ message: 'Market updates table fixed successfully!' });
  } catch (error) {
    console.error('Fix market updates error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add pickup column to orders table
app.get('/api/add-pickup-column', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const client = await pool.connect();
    
    // Add is_picked_up column to orders table
    await client.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_picked_up BOOLEAN DEFAULT FALSE
    `);
    
    client.release();
    res.json({ message: 'Pickup column added to orders table successfully!' });
  } catch (error) {
    console.error('Add pickup column error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create sample products for testing
app.get('/api/create-sample-products', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const client = await pool.connect();
    
    const sampleProducts = [
      { name: 'Premium Health Supplement', description: 'High-quality health supplement for daily wellness', price: 49.99, category: 'Health', stock: 100 },
      { name: 'Organic Tea Blend', description: 'Natural organic tea blend for relaxation', price: 29.99, category: 'Beverages', stock: 50 },
      { name: 'Fitness Tracker', description: 'Smart fitness tracker with heart rate monitor', price: 89.99, category: 'Electronics', stock: 25 }
    ];
    
    for (const product of sampleProducts) {
      // Check if product exists
      const existing = await client.query('SELECT id FROM products WHERE name = $1', [product.name]);
      if (existing.rows.length === 0) {
        await client.query(
          'INSERT INTO products (name, description, price, category, stock) VALUES ($1, $2, $3, $4, $5)',
          [product.name, product.description, product.price, product.category, product.stock]
        );
      }
    }
    
    client.release();
    res.json({ message: 'Sample products created successfully!' });
  } catch (error) {
    console.error('Sample products creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create deposit_requests table
app.get('/api/setup-deposit-table', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const client = await pool.connect();
    
    // Create deposit_requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS deposit_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        payment_proof VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON deposit_requests(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON deposit_requests(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_deposit_requests_created_at ON deposit_requests(created_at)');
    
    client.release();
    res.json({ message: 'Deposit requests table created successfully!' });
  } catch (error) {
    console.error('Deposit table setup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create sample users for testing
app.get('/api/create-sample-users', async (req, res) => {
  const { Pool } = require('pg');
  const bcrypt = require('bcryptjs');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const client = await pool.connect();
    
    const sampleUsers = [
      { name: 'John Doe', email: 'john@example.com', phone: '+234123456789' },
      { name: 'Jane Smith', email: 'jane@example.com', phone: '+234987654321' },
      { name: 'Mike Johnson', email: 'mike@example.com', phone: '+234555666777' }
    ];
    
    for (const user of sampleUsers) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // Check if user exists
      const existing = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
      if (existing.rows.length === 0) {
        // Create user
        const userResult = await client.query(
          'INSERT INTO users (full_name, email, phone, password, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [user.name, user.email, user.phone, hashedPassword, true]
        );
        
        // Create wallet
        await client.query(
          'INSERT INTO wallets (user_id, balance, total_earned) VALUES ($1, $2, $3)',
          [userResult.rows[0].id, Math.floor(Math.random() * 50000), Math.floor(Math.random() * 100000)]
        );
      }
    }
    
    client.release();
    res.json({ message: 'Sample users created successfully!' });
  } catch (error) {
    console.error('Sample users creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fix database tables
app.get('/api/fix-database', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
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



// Run MLM migration
app.get('/api/run-mlm-migration', async (req, res) => {
  const { Pool } = require('pg');
  const fs = require('fs');
  const path = require('path');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const client = await pool.connect();
    const sqlPath = path.join(__dirname, '../database/mlm-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await client.query(sql);
    client.release();
    res.json({ success: true, message: 'MLM tables created successfully!' });
  } catch (error) {
    console.error('MLM migration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fix no_stage users
app.get('/api/fix-no-stage', async (req, res) => {
  const { Pool } = require('pg');
  const fs = require('fs');
  const path = require('path');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const client = await pool.connect();
    const sqlPath = path.join(__dirname, '../database/fix-no-stage.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await client.query(sql);
    client.release();
    res.json({ success: true, message: 'All users updated to feeder stage!' });
  } catch (error) {
    console.error('Fix no_stage error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Setup MLM system (creates tables + fixes users)
app.get('/api/setup-mlm', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const client = await pool.connect();
    
    await client.query('DROP TABLE IF EXISTS mlm_matrix CASCADE');
    await client.query('DROP TABLE IF EXISTS referral_earnings CASCADE');
    await client.query('DROP TABLE IF EXISTS level_progressions CASCADE');
    await client.query('DROP TABLE IF EXISTS stage_matrix CASCADE');
    
    await client.query(`CREATE TABLE mlm_matrix (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      stage VARCHAR(50) NOT NULL,
      parent_id INTEGER REFERENCES users(id),
      position VARCHAR(10),
      level INTEGER DEFAULT 1,
      left_child_id INTEGER REFERENCES users(id),
      right_child_id INTEGER REFERENCES users(id),
      is_complete BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await client.query(`CREATE TABLE referral_earnings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      referred_user_id INTEGER REFERENCES users(id) NOT NULL,
      stage VARCHAR(50) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await client.query(`CREATE TABLE level_progressions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      from_stage VARCHAR(50) NOT NULL,
      to_stage VARCHAR(50) NOT NULL,
      matrix_count INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await client.query(`CREATE TABLE stage_matrix (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      stage VARCHAR(50) NOT NULL,
      slots_filled INTEGER DEFAULT 0,
      slots_required INTEGER NOT NULL,
      is_complete BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, stage)
    )`);
    
    await client.query('CREATE INDEX IF NOT EXISTS idx_mlm_matrix_user ON mlm_matrix(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_mlm_matrix_stage ON mlm_matrix(stage)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_referral_earnings_user ON referral_earnings(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_stage_matrix_user ON stage_matrix(user_id)');
    
    await client.query("UPDATE users SET mlm_level = 'feeder' WHERE mlm_level = 'no_stage' OR mlm_level IS NULL");
    
    await client.query(`
      INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
      SELECT id, 'feeder', 0, 6
      FROM users
      ON CONFLICT (user_id, stage) DO NOTHING
    `);
    
    client.release();
    res.json({ success: true, message: 'MLM system setup completed successfully!' });
  } catch (error) {
    console.error('MLM setup error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset database tables
app.get('/api/reset-database', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
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
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
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

// Fix user wallet balance (remove MLM earnings from balance)
app.get('/api/fix-wallet-balance/:email', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const client = await pool.connect();
    const { email } = req.params;
    
    const user = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      client.release();
      return res.json({ error: 'User not found' });
    }
    
    const userId = user.rows[0].id;
    
    // Get total MLM earnings
    const mlmEarnings = await client.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM referral_earnings WHERE user_id = $1 AND status = $2',
      [userId, 'completed']
    );
    
    const totalEarned = parseFloat(mlmEarnings.rows[0].total);
    
    // Get current wallet
    const wallet = await client.query('SELECT balance, total_earned FROM wallets WHERE user_id = $1', [userId]);
    const currentBalance = parseFloat(wallet.rows[0].balance);
    const currentTotalEarned = parseFloat(wallet.rows[0].total_earned);
    
    // Calculate actual deposit balance (current balance - MLM earnings)
    const depositBalance = currentBalance - totalEarned;
    
    // Update wallet: set balance to deposits only, total_earned to MLM earnings
    await client.query(
      'UPDATE wallets SET balance = $1, total_earned = $2 WHERE user_id = $3',
      [Math.max(0, depositBalance), totalEarned, userId]
    );
    
    client.release();
    
    res.json({
      success: true,
      message: 'Wallet balance fixed',
      before: { balance: currentBalance, total_earned: currentTotalEarned },
      after: { balance: Math.max(0, depositBalance), total_earned: totalEarned }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug user data
app.get('/api/debug-user/:email', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const client = await pool.connect();
    const { email } = req.params;
    
    // Get user
    const user = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      client.release();
      return res.json({ error: 'User not found' });
    }
    
    const userId = user.rows[0].id;
    
    // Get wallet
    const wallet = await client.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
    
    // Get stage_matrix
    const stageMatrix = await client.query('SELECT * FROM stage_matrix WHERE user_id = $1', [userId]);
    
    // Get referral_earnings
    const earnings = await client.query('SELECT * FROM referral_earnings WHERE user_id = $1', [userId]);
    
    // Count completed earnings
    const completedCount = await client.query(
      'SELECT COUNT(*) as count FROM referral_earnings WHERE user_id = $1 AND status = $2',
      [userId, 'completed']
    );
    
    // Sum of MLM earnings
    const mlmSum = await client.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM referral_earnings WHERE user_id = $1 AND status = $2',
      [userId, 'completed']
    );
    
    client.release();
    
    res.json({
      user: user.rows[0],
      wallet: wallet.rows[0],
      stageMatrix: stageMatrix.rows,
      earnings: earnings.rows,
      completedEarningsCount: completedCount.rows[0].count,
      mlmEarningsTotal: mlmSum.rows[0].total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fix stage matrix counts
app.get('/api/fix-stage-matrix', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const client = await pool.connect();
    
    // Fix stage_matrix for all users based on actual referral_earnings
    await client.query(`
      INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
      SELECT 
        u.id,
        u.mlm_level,
        COALESCE((
          SELECT COUNT(*) 
          FROM referral_earnings re
          WHERE re.user_id = u.id AND re.stage = u.mlm_level AND re.status = 'completed'
        ), 0) as slots_filled,
        CASE 
          WHEN u.mlm_level = 'feeder' THEN 6
          WHEN u.mlm_level IN ('bronze', 'silver', 'gold', 'diamond') THEN 14
          ELSE 0
        END as slots_required
      FROM users u
      WHERE u.mlm_level IS NOT NULL AND u.mlm_level != 'no_stage'
      ON CONFLICT (user_id, stage) 
      DO UPDATE SET 
        slots_filled = EXCLUDED.slots_filled,
        is_complete = (EXCLUDED.slots_filled >= EXCLUDED.slots_required)
    `);
    
    client.release();
    res.json({ success: true, message: 'Stage matrix fixed successfully!' });
  } catch (error) {
    console.error('Fix stage matrix error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Complete matrix to reach silver level
app.get('/api/complete-to-silver/:email', async (req, res) => {
  const { Pool } = require('pg');
  const bcrypt = require('bcryptjs');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const { email } = req.params;
    const client = await pool.connect();
    
    const userCheck = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userCheck.rows[0];
    const userId = user.id;
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create 2 frontline referrals
    const frontlineUsers = [];
    for (let i = 1; i <= 2; i++) {
      const result = await client.query(`
        INSERT INTO users (full_name, email, phone, password, referred_by, mlm_level, joining_fee_paid, is_active)
        VALUES ($1, $2, $3, $4, $5, 'feeder', true, true)
        RETURNING id, email, referral_code
      `, [`Frontline ${i}`, `front_${Date.now()}_${i}@test.com`, `+234${Math.floor(Math.random() * 1000000000)}`, hashedPassword, user.referral_code]);
      
      const newUser = result.rows[0];
      frontlineUsers.push(newUser);
      
      await client.query('INSERT INTO wallets (user_id, balance, total_earned) VALUES ($1, 0, 0)', [newUser.id]);
      await client.query('INSERT INTO deposit_requests (user_id, amount, status) VALUES ($1, 18000, $2)', [newUser.id, 'approved']);
      await client.query('INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required) VALUES ($1, $2, 0, 6)', [newUser.id, 'feeder']);
      
      await client.query(`
        INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount, status)
        VALUES ($1, $2, 'bronze', 4.8, 'completed')
      `, [userId, newUser.id]);
      
      await client.query('UPDATE wallets SET total_earned = total_earned + 4.8 WHERE user_id = $1', [userId]);
      await client.query(`
        INSERT INTO transactions (user_id, type, amount, description, status)
        VALUES ($1, 'referral_bonus', 4.8, $2, 'completed')
      `, [userId, `Bronze referral from ${newUser.email}`]);
    }
    
    // Each frontline gets 2 referrals (4 total)
    const secondLevelUsers = [];
    for (let i = 0; i < frontlineUsers.length; i++) {
      for (let j = 1; j <= 2; j++) {
        const result = await client.query(`
          INSERT INTO users (full_name, email, phone, password, referred_by, mlm_level, joining_fee_paid, is_active)
          VALUES ($1, $2, $3, $4, $5, 'feeder', true, true)
          RETURNING id, email, referral_code
        `, [`Level2 ${i+1}-${j}`, `level2_${Date.now()}_${i}_${j}@test.com`, `+234${Math.floor(Math.random() * 1000000000)}`, hashedPassword, frontlineUsers[i].referral_code]);
        
        const newUser = result.rows[0];
        secondLevelUsers.push(newUser);
        
        await client.query('INSERT INTO wallets (user_id, balance, total_earned) VALUES ($1, 0, 0)', [newUser.id]);
        await client.query('INSERT INTO deposit_requests (user_id, amount, status) VALUES ($1, 18000, $2)', [newUser.id, 'approved']);
        await client.query('INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required) VALUES ($1, $2, 0, 6)', [newUser.id, 'feeder']);
        
        await client.query(`
          INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount, status)
          VALUES ($1, $2, 'bronze', 4.8, 'completed')
        `, [userId, newUser.id]);
        
        await client.query('UPDATE wallets SET total_earned = total_earned + 4.8 WHERE user_id = $1', [userId]);
        await client.query(`
          INSERT INTO transactions (user_id, type, amount, description, status)
          VALUES ($1, 'referral_bonus', 4.8, $2, 'completed')
        `, [userId, `Bronze referral from ${newUser.email}`]);
      }
    }
    
    // Each second level gets 2 referrals (8 total)
    for (let i = 0; i < secondLevelUsers.length; i++) {
      for (let j = 1; j <= 2; j++) {
        const result = await client.query(`
          INSERT INTO users (full_name, email, phone, password, referred_by, mlm_level, joining_fee_paid, is_active)
          VALUES ($1, $2, $3, $4, $5, 'feeder', true, true)
          RETURNING id, email
        `, [`Level3 ${i+1}-${j}`, `level3_${Date.now()}_${i}_${j}@test.com`, `+234${Math.floor(Math.random() * 1000000000)}`, hashedPassword, secondLevelUsers[i].referral_code]);
        
        const newUser = result.rows[0];
        
        await client.query('INSERT INTO wallets (user_id, balance, total_earned) VALUES ($1, 0, 0)', [newUser.id]);
        await client.query('INSERT INTO deposit_requests (user_id, amount, status) VALUES ($1, 18000, $2)', [newUser.id, 'approved']);
        await client.query('INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required) VALUES ($1, $2, 0, 6)', [newUser.id, 'feeder']);
        
        await client.query(`
          INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount, status)
          VALUES ($1, $2, 'bronze', 4.8, 'completed')
        `, [userId, newUser.id]);
        
        await client.query('UPDATE wallets SET total_earned = total_earned + 4.8 WHERE user_id = $1', [userId]);
        await client.query(`
          INSERT INTO transactions (user_id, type, amount, description, status)
          VALUES ($1, 'referral_bonus', 4.8, $2, 'completed')
        `, [userId, `Bronze referral from ${newUser.email}`]);
      }
    }
    
    // Update bronze stage_matrix to complete
    await client.query(`
      UPDATE stage_matrix SET slots_filled = 14, is_complete = true, completed_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND stage = 'bronze'
    `, [userId]);
    
    // Progress to silver
    await client.query('UPDATE users SET mlm_level = $1 WHERE id = $2', ['silver', userId]);
    await client.query(`
      INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
      VALUES ($1, 'silver', 0, 14)
      ON CONFLICT (user_id, stage) DO NOTHING
    `, [userId]);
    
    await client.query(`
      INSERT INTO level_progressions (user_id, from_stage, to_stage, matrix_count)
      VALUES ($1, 'bronze', 'silver', 14)
    `, [userId]);
    
    await client.query(`
      INSERT INTO market_updates (user_id, title, message, type)
      VALUES ($1, 'Stage Upgrade!', 'Congratulations! You have been promoted to SILVER stage!', 'success')
    `, [userId]);
    
    const updatedUser = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
    const wallet = await client.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
    
    client.release();
    
    res.json({
      success: true,
      message: 'Completed bronze stage and progressed to silver!',
      user: updatedUser.rows[0],
      wallet: wallet.rows[0],
      bronzeEarnings: 14 * 4.8,
      totalEarnings: parseFloat(wallet.rows[0].total_earned)
    });
  } catch (error) {
    console.error('Complete to silver error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add dashboard_unlocked column if missing
app.get('/api/add-dashboard-columns', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const client = await pool.connect();
    
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS deposit_confirmed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deposit_confirmed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS dashboard_unlocked BOOLEAN DEFAULT FALSE
    `);
    
    await client.query(`ALTER TABLE users ALTER COLUMN mlm_level SET DEFAULT 'no_stage'`);
    
    // Update existing users without these columns
    await client.query(`
      UPDATE users 
      SET dashboard_unlocked = FALSE, deposit_confirmed = FALSE
      WHERE dashboard_unlocked IS NULL OR deposit_confirmed IS NULL
    `);
    
    client.release();
    res.json({ success: true, message: 'Dashboard columns added successfully!' });
  } catch (error) {
    console.error('Add columns error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reset user to no_stage (for testing dashboard lock)
app.get('/api/reset-user-to-no-stage/:email', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const { email } = req.params;
    const client = await pool.connect();
    
    const result = await client.query(
      `UPDATE users 
       SET mlm_level = 'no_stage', dashboard_unlocked = FALSE, deposit_confirmed = FALSE 
       WHERE email = $1 
       RETURNING id, email, mlm_level, dashboard_unlocked`,
      [email]
    );
    
    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'User not found' });
    }
    
    client.release();
    res.json({
      success: true,
      message: 'User reset to no_stage with locked dashboard',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Reset user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint: Generate full matrix for a user
app.get('/api/test-generate-matrix/:email', async (req, res) => {
  const { Pool } = require('pg');
  const bcrypt = require('bcryptjs');
  const mlmService = require('./services/mlmService');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const { email } = req.params;
    const { stage } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'email is required in URL' });
    }
    
    const client = await pool.connect();
    
    // Check if user exists by email
    const userCheck = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'User not found with that email' });
    }
    
    const user = userCheck.rows[0];
    const userId = user.id;
    
    // If user is at no_stage, update them to feeder first
    if (user.mlm_level === 'no_stage' || !user.mlm_level) {
      await client.query("UPDATE users SET mlm_level = 'feeder' WHERE id = $1", [userId]);
      await client.query(`
        INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
        VALUES ($1, 'feeder', 0, 6)
        ON CONFLICT (user_id, stage) DO NOTHING
      `, [userId]);
      user.mlm_level = 'feeder';
    }
    
    const currentStage = stage || user.mlm_level;
    const slotsRequired = currentStage === 'feeder' ? 6 : 14;
    const bonusAmount = currentStage === 'feeder' ? 1.5 : (currentStage === 'bronze' ? 4.8 : (currentStage === 'silver' ? 30 : (currentStage === 'gold' ? 150 : 750)));
    
    // Ensure main user has mlm_matrix entry
    await client.query(`
      INSERT INTO mlm_matrix (user_id, stage, parent_id, position, level)
      VALUES ($1, $2, NULL, 'root', 1)
      ON CONFLICT DO NOTHING
    `, [userId, currentStage]);
    
    const createdUsers = [];
    
    // Generate paid users
    for (let i = 1; i <= slotsRequired; i++) {
      const testEmail = `test${Date.now()}_${i}@example.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // Create user
      const newUserResult = await client.query(`
        INSERT INTO users (full_name, email, phone, password, referred_by, mlm_level, joining_fee_paid, is_active)
        VALUES ($1, $2, $3, $4, $5, 'feeder', true, true)
        RETURNING id, email, full_name
      `, [`Test User ${i}`, testEmail, `+234${Math.floor(Math.random() * 1000000000)}`, hashedPassword, user.referral_code]);
      
      const newUser = newUserResult.rows[0];
      
      // Create wallet
      await client.query(
        'INSERT INTO wallets (user_id, balance, total_earned) VALUES ($1, 0, 0)',
        [newUser.id]
      );
      
      // Create approved deposit so they show as paid
      await client.query(`
        INSERT INTO deposit_requests (user_id, amount, status)
        VALUES ($1, 18000, 'approved')
      `, [newUser.id]);
      
      // Create stage_matrix for new user
      await client.query(`
        INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
        VALUES ($1, 'feeder', 0, 6)
        ON CONFLICT (user_id, stage) DO NOTHING
      `, [newUser.id]);
      
      // Add to mlm_matrix (binary tree structure)
      const position = i % 2 === 1 ? 'left' : 'right';
      const level = Math.floor((i - 1) / 2) + 1;
      await client.query(`
        INSERT INTO mlm_matrix (user_id, stage, parent_id, position, level)
        VALUES ($1, $2, $3, $4, $5)
      `, [newUser.id, currentStage, userId, position, level]);
      
      // Update parent's left or right child reference
      if (position === 'left') {
        await client.query(
          'UPDATE mlm_matrix SET left_child_id = $1 WHERE user_id = $2 AND stage = $3',
          [newUser.id, userId, currentStage]
        );
      } else {
        await client.query(
          'UPDATE mlm_matrix SET right_child_id = $1 WHERE user_id = $2 AND stage = $3',
          [newUser.id, userId, currentStage]
        );
      }
      
      // Process referral (this will credit the main user)
      await client.query(`
        INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount, status)
        VALUES ($1, $2, $3, $4, 'completed')
      `, [userId, newUser.id, currentStage, bonusAmount]);
      
      // Update main user's wallet (only MLM earnings, not deposit balance)
      await client.query(`
        UPDATE wallets 
        SET total_earned = total_earned + $1
        WHERE user_id = $2
      `, [bonusAmount, userId]);
      
      // Add transaction
      await client.query(`
        INSERT INTO transactions (user_id, type, amount, description, status)
        VALUES ($1, 'referral_bonus', $2, $3, 'completed')
      `, [userId, bonusAmount, `Referral bonus from ${newUser.email}`]);
      
      createdUsers.push(newUser);
    }
    
    // Update stage_matrix to mark as complete
    await client.query(`
      UPDATE stage_matrix 
      SET slots_filled = $1, is_complete = true, completed_at = CURRENT_TIMESTAMP
      WHERE user_id = $2 AND stage = $3
    `, [slotsRequired, userId, currentStage]);
    
    // Trigger automatic progression
    const stageProgression = {
      'no_stage': 'feeder',
      'feeder': 'bronze',
      'bronze': 'silver',
      'silver': 'gold',
      'gold': 'diamond',
      'diamond': 'infinity'
    };
    
    const nextStage = stageProgression[currentStage];
    let progressionMessage = '';
    
    if (nextStage) {
      // Update user to next stage
      await client.query('UPDATE users SET mlm_level = $1 WHERE id = $2', [nextStage, userId]);
      
      // Create stage_matrix for next stage
      const nextStageSlots = nextStage === 'infinity' ? 0 : (nextStage === 'feeder' ? 6 : 14);
      await client.query(`
        INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required)
        VALUES ($1, $2, 0, $3)
        ON CONFLICT (user_id, stage) DO NOTHING
      `, [userId, nextStage, nextStageSlots]);
      
      // Record progression
      await client.query(`
        INSERT INTO level_progressions (user_id, from_stage, to_stage, matrix_count)
        VALUES ($1, $2, $3, $4)
      `, [userId, currentStage, nextStage, slotsRequired]);
      
      // Send notification
      await client.query(`
        INSERT INTO market_updates (user_id, title, message, type)
        VALUES ($1, $2, $3, 'success')
      `, [userId, 'Stage Upgrade!', `Congratulations! You've been promoted from ${currentStage.toUpperCase()} to ${nextStage.toUpperCase()} stage!`]);
      
      progressionMessage = ` → Automatically progressed to ${nextStage.toUpperCase()}`;
    }
    
    // Get updated user info with referral count
    const updatedUser = await client.query(`
      SELECT u.*, w.balance, w.total_earned, sm.slots_filled, sm.is_complete,
             (SELECT COUNT(*) FROM users WHERE referred_by = u.referral_code) as total_referrals
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      LEFT JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = u.mlm_level
      WHERE u.id = $1
    `, [userId]);
    
    client.release();
    
    res.json({
      success: true,
      message: `Generated ${slotsRequired} paid users for ${user.email}${progressionMessage}`,
      previousStage: currentStage,
      currentStage: updatedUser.rows[0].mlm_level,
      progressed: nextStage ? true : false,
      user: updatedUser.rows[0],
      createdUsers: createdUsers,
      totalEarnings: bonusAmount * slotsRequired,
      matrixComplete: true
    });
  } catch (error) {
    console.error('Generate matrix error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Auto-correct all user stages based on completed matrices
app.get('/api/auto-correct-stages', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const client = await pool.connect();
    const corrections = [];
    
    // Get all users
    const users = await client.query('SELECT id, email, mlm_level FROM users');
    
    for (const user of users.rows) {
      const userId = user.id;
      let correctStage = 'no_stage';
      
      // Check feeder completion (6 paid members at no_stage)
      const feederCount = await client.query(`
        SELECT COUNT(*) as count FROM stage_matrix 
        WHERE user_id = $1 AND stage = 'no_stage' AND slots_filled >= 6
      `, [userId]);
      
      // If no no_stage matrix, check if they have any referrals
      if (parseInt(feederCount.rows[0].count) === 0) {
        const anyReferrals = await client.query(`
          SELECT COUNT(*) as count FROM referral_earnings WHERE user_id = $1
        `, [userId]);
        if (parseInt(anyReferrals.rows[0].count) >= 6) {
          correctStage = 'feeder';
        }
      }
      
      if (parseInt(feederCount.rows[0].count) >= 6) {
        correctStage = 'feeder';
        
        // Check bronze completion (14 feeder-completed members)
        const bronzeMembers = await client.query(`
          SELECT COUNT(*) as count FROM referral_earnings re
          WHERE re.user_id = $1 AND re.stage = 'feeder'
          AND EXISTS (
            SELECT 1 FROM stage_matrix sm 
            WHERE sm.user_id = re.referred_user_id AND sm.stage = 'feeder' AND sm.is_complete = true
          )
        `, [userId]);
        
        if (parseInt(bronzeMembers.rows[0].count) >= 14) {
          correctStage = 'bronze';
          
          // Check silver completion (14 bronze-completed members)
          const silverMembers = await client.query(`
            SELECT COUNT(*) as count FROM referral_earnings re
            WHERE re.user_id = $1 AND re.stage = 'bronze'
            AND EXISTS (
              SELECT 1 FROM stage_matrix sm 
              WHERE sm.user_id = re.referred_user_id AND sm.stage = 'bronze' AND sm.is_complete = true
            )
          `, [userId]);
          
          if (parseInt(silverMembers.rows[0].count) >= 14) {
            correctStage = 'silver';
          }
        }
      }
      
      // Update if different
      if (user.mlm_level !== correctStage) {
        await client.query('UPDATE users SET mlm_level = $1 WHERE id = $2', [correctStage, userId]);
        corrections.push({ email: user.email, from: user.mlm_level, to: correctStage });
      }
    }
    
    client.release();
    res.json({ success: true, corrected: corrections.length, corrections });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate complete matrix for any stage
app.get('/api/generate-complete-matrix/:email/:stage', cors({ origin: '*' }), async (req, res) => {
  const { Pool } = require('pg');
  const bcrypt = require('bcryptjs');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const { email, stage } = req.params;
    const client = await pool.connect();
    
    const user = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = user.rows[0].id;
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    const accounts = [];
    let totalEarnings = 0;
    
    const stageConfig = {
      feeder: { slots: 6, bonus: 1.5, nextStage: 'feeder', currentStage: 'no_stage' },
      bronze: { slots: 14, bonus: 1.5, nextStage: 'bronze', currentStage: 'feeder' },
      silver: { slots: 14, bonus: 4.8, nextStage: 'silver', currentStage: 'bronze' },
      gold: { slots: 14, bonus: 30, nextStage: 'gold', currentStage: 'silver' },
      diamond: { slots: 14, bonus: 150, nextStage: 'diamond', currentStage: 'gold' }
    };
    
    const config = stageConfig[stage];
    if (!config) {
      client.release();
      return res.status(400).json({ error: 'Invalid stage' });
    }
    
    // Recursive function to create complete downline with all sub-levels
    async function createCompleteDownline(parentCode, parentId, targetStage, depth = 0) {
      if (depth > 5) return 0;
      
      const slotsNeeded = targetStage === 'feeder' ? 6 : 14;
      let totalCreated = 0;
      
      for (let i = 1; i <= slotsNeeded; i++) {
        const newUser = await client.query(`
          INSERT INTO users (full_name, email, phone, password, referred_by, mlm_level, joining_fee_paid, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, true, true)
          RETURNING id, email, full_name, referral_code
        `, [`${targetStage} D${depth} #${i}`, `${targetStage}_${Date.now()}_${depth}_${i}_${Math.random().toString(36).substr(2, 5)}@test.com`, `+234${Math.floor(Math.random() * 1000000000)}`, hashedPassword, parentCode, targetStage]);
        
        const newUserId = newUser.rows[0].id;
        await client.query('INSERT INTO wallets (user_id, balance, total_earned) VALUES ($1, 0, 0)', [newUserId]);
        await client.query('INSERT INTO deposit_requests (user_id, amount, status) VALUES ($1, 18000, $2)', [newUserId, 'approved']);
        
        // Mark their stage as complete
        const subSlots = targetStage === 'feeder' ? 6 : 14;
        await client.query('INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required, is_complete) VALUES ($1, $2, $3, $3, true) ON CONFLICT (user_id, stage) DO UPDATE SET is_complete = true, slots_filled = $3', [newUserId, targetStage, subSlots]);
        
        // Add earnings to parent
        const bonusAmount = targetStage === 'feeder' ? 1.5 : 4.8;
        await client.query('INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount, status) VALUES ($1, $2, $3, $4, $5)', [parentId, newUserId, targetStage, bonusAmount, 'completed']);
        await client.query('UPDATE wallets SET total_earned = total_earned + $1 WHERE user_id = $2', [bonusAmount, parentId]);
        
        accounts.push(newUser.rows[0]);
        totalCreated++;
        
        // Create their complete downline recursively
        if (targetStage === 'bronze') {
          // Each bronze account needs 14 completed feeder accounts
          for (let j = 1; j <= 14; j++) {
            const feederUser = await client.query(`
              INSERT INTO users (full_name, email, phone, password, referred_by, mlm_level, joining_fee_paid, is_active)
              VALUES ($1, $2, $3, $4, $5, 'feeder', true, true)
              RETURNING id, email, full_name, referral_code
            `, [`Feeder for Bronze D${depth} #${i}-${j}`, `feeder_${Date.now()}_${depth}_${i}_${j}_${Math.random().toString(36).substr(2, 5)}@test.com`, `+234${Math.floor(Math.random() * 1000000000)}`, hashedPassword, newUser.rows[0].referral_code]);
            
            const feederId = feederUser.rows[0].id;
            await client.query('INSERT INTO wallets (user_id, balance, total_earned) VALUES ($1, 0, 0)', [feederId]);
            await client.query('INSERT INTO deposit_requests (user_id, amount, status) VALUES ($1, 18000, $2)', [feederId, 'approved']);
            await client.query('INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required, is_complete) VALUES ($1, $2, 6, 6, true) ON CONFLICT (user_id, stage) DO UPDATE SET is_complete = true, slots_filled = 6', [feederId, 'feeder']);
            
            // Each feeder needs 6 people
            for (let k = 1; k <= 6; k++) {
              const baseUser = await client.query(`
                INSERT INTO users (full_name, email, phone, password, referred_by, mlm_level, joining_fee_paid, is_active)
                VALUES ($1, $2, $3, $4, $5, 'no_stage', true, true)
                RETURNING id, email, full_name
              `, [`Base for Feeder D${depth} #${i}-${j}-${k}`, `base_${Date.now()}_${depth}_${i}_${j}_${k}_${Math.random().toString(36).substr(2, 5)}@test.com`, `+234${Math.floor(Math.random() * 1000000000)}`, hashedPassword, feederUser.rows[0].referral_code]);
              
              await client.query('INSERT INTO wallets (user_id, balance, total_earned) VALUES ($1, 0, 0)', [baseUser.rows[0].id]);
              await client.query('INSERT INTO deposit_requests (user_id, amount, status) VALUES ($1, 18000, $2)', [baseUser.rows[0].id, 'approved']);
              await client.query('INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount, status) VALUES ($1, $2, $3, 1.5, $4)', [feederId, baseUser.rows[0].id, 'feeder', 'completed']);
              await client.query('UPDATE wallets SET total_earned = total_earned + 1.5 WHERE user_id = $1', [feederId]);
              totalCreated++;
              accounts.push(baseUser.rows[0]);
            }
            
            await client.query('INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount, status) VALUES ($1, $2, $3, 1.5, $4)', [newUserId, feederId, 'feeder', 'completed']);
            await client.query('UPDATE wallets SET total_earned = total_earned + 1.5 WHERE user_id = $1', [newUserId]);
            totalCreated++;
            accounts.push(feederUser.rows[0]);
          }
        }
      }
      
      return totalCreated;
    }
    
    // Generate the complete structure
    let totalCreated = 0;
    
    if (stage === 'feeder') {
      // Simple: create 6 people
      for (let i = 1; i <= 6; i++) {
        const newUser = await client.query(`
          INSERT INTO users (full_name, email, phone, password, referred_by, mlm_level, joining_fee_paid, is_active)
          VALUES ($1, $2, $3, $4, $5, 'no_stage', true, true)
          RETURNING id, email, full_name
        `, [`Feeder Member ${i}`, `feeder_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 5)}@test.com`, `+234${Math.floor(Math.random() * 1000000000)}`, hashedPassword, user.rows[0].referral_code]);
        
        await client.query('INSERT INTO wallets (user_id, balance, total_earned) VALUES ($1, 0, 0)', [newUser.rows[0].id]);
        await client.query('INSERT INTO deposit_requests (user_id, amount, status) VALUES ($1, 18000, $2)', [newUser.rows[0].id, 'approved']);
        await client.query('INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount, status) VALUES ($1, $2, $3, 1.5, $4)', [userId, newUser.rows[0].id, 'feeder', 'completed']);
        await client.query('UPDATE wallets SET total_earned = total_earned + 1.5 WHERE user_id = $1', [userId]);
        totalEarnings += 1.5;
        totalCreated++;
        accounts.push(newUser.rows[0]);
      }
    } else if (stage === 'bronze') {
      // Create 14 feeder accounts, each with 6 people (84 total)
      for (let i = 1; i <= 14; i++) {
        const feederUser = await client.query(`
          INSERT INTO users (full_name, email, phone, password, referred_by, mlm_level, joining_fee_paid, is_active)
          VALUES ($1, $2, $3, $4, $5, 'feeder', true, true)
          RETURNING id, email, full_name, referral_code
        `, [`Feeder ${i}`, `feeder_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 5)}@test.com`, `+234${Math.floor(Math.random() * 1000000000)}`, hashedPassword, user.rows[0].referral_code]);
        
        const feederId = feederUser.rows[0].id;
        await client.query('INSERT INTO wallets (user_id, balance, total_earned) VALUES ($1, 0, 0)', [feederId]);
        await client.query('INSERT INTO deposit_requests (user_id, amount, status) VALUES ($1, 18000, $2)', [feederId, 'approved']);
        await client.query('INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required, is_complete) VALUES ($1, $2, 6, 6, true) ON CONFLICT (user_id, stage) DO UPDATE SET is_complete = true, slots_filled = 6', [feederId, 'feeder']);
        await client.query('INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount, status) VALUES ($1, $2, $3, 1.5, $4)', [userId, feederId, 'feeder', 'completed']);
        await client.query('UPDATE wallets SET total_earned = total_earned + 1.5 WHERE user_id = $1', [userId]);
        totalEarnings += 1.5;
        totalCreated++;
        accounts.push(feederUser.rows[0]);
        
        // Each feeder needs 6 people
        for (let j = 1; j <= 6; j++) {
          const baseUser = await client.query(`
            INSERT INTO users (full_name, email, phone, password, referred_by, mlm_level, joining_fee_paid, is_active)
            VALUES ($1, $2, $3, $4, $5, 'no_stage', true, true)
            RETURNING id, email, full_name
          `, [`Member ${i}-${j}`, `member_${Date.now()}_${i}_${j}_${Math.random().toString(36).substr(2, 5)}@test.com`, `+234${Math.floor(Math.random() * 1000000000)}`, hashedPassword, feederUser.rows[0].referral_code]);
          
          await client.query('INSERT INTO wallets (user_id, balance, total_earned) VALUES ($1, 0, 0)', [baseUser.rows[0].id]);
          await client.query('INSERT INTO deposit_requests (user_id, amount, status) VALUES ($1, 18000, $2)', [baseUser.rows[0].id, 'approved']);
          await client.query('INSERT INTO referral_earnings (user_id, referred_user_id, stage, amount, status) VALUES ($1, $2, $3, 1.5, $4)', [feederId, baseUser.rows[0].id, 'feeder', 'completed']);
          await client.query('UPDATE wallets SET total_earned = total_earned + 1.5 WHERE user_id = $1', [feederId]);
          totalCreated++;
          accounts.push(baseUser.rows[0]);
        }
      }
    } else {
      totalCreated = await createCompleteDownline(user.rows[0].referral_code, userId, stage, 0);
      totalEarnings = config.slots * config.bonus;
    }
    
    // Update user to next stage
    await client.query('UPDATE users SET mlm_level = $1 WHERE id = $2', [config.nextStage, userId]);
    await client.query('INSERT INTO stage_matrix (user_id, stage, slots_filled, slots_required, is_complete) VALUES ($1, $2, $3, $3, true) ON CONFLICT (user_id, stage) DO UPDATE SET is_complete = true, slots_filled = $3', [userId, config.currentStage, config.slots]);
    
    client.release();
    res.json({
      success: true,
      totalCreated,
      totalEarnings,
      newStage: config.nextStage,
      accounts: accounts.slice(0, 100)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset user to feeder stage
app.get('/api/reset-to-feeder/:email', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const { email } = req.params;
    const client = await pool.connect();
    const user = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = user.rows[0].id;
    await client.query('UPDATE users SET mlm_level = $1 WHERE id = $2', ['feeder', userId]);
    await client.query('UPDATE stage_matrix SET is_complete = true WHERE user_id = $1 AND stage = $2', [userId, 'feeder']);
    await client.query('UPDATE stage_matrix SET slots_filled = 0, is_complete = false WHERE user_id = $1 AND stage = $2', [userId, 'bronze']);
    client.release();
    res.json({ success: true, message: 'User reset to Feeder stage' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fix all referral earnings system-wide
app.get('/api/fix-all-referral-earnings', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
  });
  
  try {
    const client = await pool.connect();
    const mlmService = require('./services/mlmService');
    
    const usersResult = await client.query(`
      SELECT DISTINCT u.id, u.email, u.referral_code
      FROM users u
      WHERE EXISTS (
        SELECT 1 FROM users ref
        WHERE ref.referred_by = u.referral_code
        AND EXISTS (SELECT 1 FROM deposit_requests WHERE user_id = ref.id AND status = 'approved')
      )
    `);
    
    let totalProcessed = 0;
    const results = [];
    
    for (const user of usersResult.rows) {
      const referralsResult = await client.query(`
        SELECT u.id, u.full_name, u.email
        FROM users u
        WHERE u.referred_by = $1
        AND EXISTS (SELECT 1 FROM deposit_requests WHERE user_id = u.id AND status = 'approved')
      `, [user.referral_code]);
      
      let userProcessed = 0;
      
      for (const referral of referralsResult.rows) {
        const existingEarning = await client.query(
          'SELECT id FROM referral_earnings WHERE user_id = $1 AND referred_user_id = $2',
          [user.id, referral.id]
        );
        
        if (existingEarning.rows.length === 0) {
          await mlmService.processReferral(user.id, referral.id);
          userProcessed++;
          totalProcessed++;
        }
      }
      
      if (userProcessed > 0) {
        results.push({ email: user.email, processed: userProcessed, totalReferrals: referralsResult.rows.length });
      }
    }
    
    client.release();
    
    res.json({
      success: true,
      message: `Fixed referral earnings for ${results.length} users`,
      totalProcessed: totalProcessed,
      usersFixed: results.length,
      details: results
    });
  } catch (error) {
    console.error('Fix all referral earnings error:', error);
    res.status(500).json({ success: false, error: error.message });
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});