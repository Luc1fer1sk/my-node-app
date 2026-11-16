const { getPool } = require('../config/database');
const { recordQuery } = require('../config/metrics');

async function query(sql, params = []) {
  const pool = getPool();
  const start = Date.now();
  try {
    const [rows, fields] = await pool.execute(sql, params);
    const ms = Date.now() - start;
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
    console.log(`[${ts}] [BBMO-01-23] ${sql.trim().split('\n')[0].trim()} (${ms}ms)`);
    recordQuery(ms);
    return [rows, fields];
  } catch (err) {
    recordQuery(Date.now() - start, true);
    throw err;
  }
}

async function getConnection() {
  return getPool().getConnection();
}

module.exports = { query, getConnection };
