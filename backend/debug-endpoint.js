// Add this to server.js to debug
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
    
    client.release();
    
    res.json({
      user: user.rows[0],
      wallet: wallet.rows[0],
      stageMatrix: stageMatrix.rows,
      earnings: earnings.rows,
      completedEarningsCount: completedCount.rows[0].count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
