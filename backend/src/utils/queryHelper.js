const pool = require('../config/secureDatabase');

const executeQuery = async (query, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
};

const executeTransaction = async (queries) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results = [];
    
    for (const { query, params } of queries) {
      const result = await client.query(query, params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const sanitizeForLike = (value) => {
  return value.replace(/[%_\\]/g, '\\$&');
};

module.exports = {
  executeQuery,
  executeTransaction,
  sanitizeForLike
};
