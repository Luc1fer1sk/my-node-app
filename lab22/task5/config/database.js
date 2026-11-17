const mysql = require('mysql2/promise');
const config = require('../config');

let pool = null;

function createPool() {
  pool = mysql.createPool(config.db);
  pool.on('error', (err) => {
    console.error(`[POOL ERROR] ${err.code}: ${err.message}`);
  });
  return pool;
}

function getPool() {
  if (!pool) createPool();
  return pool;
}

async function closePool() {
  if (pool) await pool.end();
}

module.exports = { createPool, getPool, closePool };
