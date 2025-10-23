const express = require('express');
const path = require('path');
require('dotenv').config();

const securityHeaders = require('./middleware/securityHeaders');
const corsConfig = require('./middleware/corsConfig');
const { csrfProtection, generateCsrfToken } = require('./middleware/csrf');
const { loginLimiter, apiLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const withdrawalRoutes = require('./routes/withdrawal');
const marketUpdatesRoutes = require('./routes/marketUpdates');
const mlmRoutes = require('./routes/mlm');
const ordersRoutes = require('./routes/orders');
const depositRoutes = require('./routes/deposit');
const adminAuthRoutes = require('./routes/adminAuth');
const adminRoutes = require('./routes/admin');

const app = express();

app.set('trust proxy', 1);

app.use(securityHeaders());
app.use(corsConfig);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/', apiLimiter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/csrf-token', generateCsrfToken, (req, res) => {
  res.json({ csrfToken: res.locals.csrfToken });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/admin/auth/login', loginLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/user', csrfProtection, userRoutes);
app.use('/api/withdrawal', csrfProtection, withdrawalRoutes);
app.use('/api/market-updates', marketUpdatesRoutes);
app.use('/api/mlm', mlmRoutes);
app.use('/api/orders', csrfProtection, ordersRoutes);
app.use('/api/deposit', csrfProtection, depositRoutes);
app.use('/api/bank', csrfProtection, require('./routes/bank'));
app.use('/api/payment', csrfProtection, require('./routes/payment'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', csrfProtection, adminRoutes);
app.use('/api/products', require('./routes/products'));

if (process.env.NODE_ENV !== 'production') {
  app.use('/api/setup', require('./routes/setup'));
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS policy violation' });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation error', errors: err.errors });
  }
  
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ message: 'Internal server error' });
  } else {
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔒 Secure server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
