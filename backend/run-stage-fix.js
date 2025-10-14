const pool = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function runStageFix() {
  console.log('Starting matrix stage fix...\n');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'database', 'fix-no-stage-matrix.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by semicolons to execute each statement separately
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.toLowerCase().includes('select')) {
        // For SELECT statements, show results
        const result = await pool.query(statement);
        console.log(`\nQuery ${i + 1} Results:`);
        console.table(result.rows);
      } else {
        // For other statements, just execute
        await pool.query(statement);
        console.log(`✓ Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('\n✅ Matrix stage fix completed successfully!\n');
    
    // Show summary
    console.log('Summary of current stage distribution:');
    const summary = await pool.query(`
      SELECT 
        u.mlm_level,
        COUNT(*) as user_count,
        COALESCE(ROUND(AVG(sm.slots_filled), 2), 0) as avg_slots_filled,
        COALESCE(AVG(sm.slots_required), 0) as avg_slots_required
      FROM users u
      LEFT JOIN stage_matrix sm ON u.id = sm.user_id AND sm.stage = u.mlm_level
      GROUP BY u.mlm_level
      ORDER BY 
        CASE u.mlm_level
          WHEN 'no_stage' THEN 1
          WHEN 'feeder' THEN 2
          WHEN 'bronze' THEN 3
          WHEN 'silver' THEN 4
          WHEN 'gold' THEN 5
          WHEN 'diamond' THEN 6
          WHEN 'infinity' THEN 7
        END
    `);
    console.table(summary.rows);
    
  } catch (error) {
    console.error('❌ Error running stage fix:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runStageFix();
