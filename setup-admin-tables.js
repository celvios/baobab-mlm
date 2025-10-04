const pool = require('./src/config/database');

async function setupAdminTables() {
  try {
    // Create admin activity logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_activity_logs (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER REFERENCES admins(id),
        action VARCHAR(255) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create settings table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default settings
    const defaultSettings = [
      ['business_name', 'Baobab MLM Business'],
      ['business_email', 'admin@baobabmlm.com'],
      ['business_phone', '+234-XXX-XXX-XXXX'],
      ['business_address', 'Lagos, Nigeria'],
      ['bank_name', 'First Bank Nigeria'],
      ['account_number', '1234567890']
    ];

    for (const [key, value] of defaultSettings) {
      await pool.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
        [key, value]
      );
    }

    console.log('Admin tables setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin tables:', error);
    process.exit(1);
  }
}

setupAdminTables();