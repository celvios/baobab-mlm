const { Pool } = require('pg');

const createSecurePool = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const config = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && isProduction ? {
      rejectUnauthorized: true,
      ca: process.env.DATABASE_CA_CERT
    } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };

  return new Pool(config);
};

const pool = createSecurePool();

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

module.exports = pool;
