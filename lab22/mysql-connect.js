require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'student',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bbmo_01_23',
};

async function testSingleConnection() {
  console.log('=== Odinochnoye soyedineniye ===');
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('[OK] Podklyucheniye ustanovleno');
    const [rows] = await connection.execute('SELECT VERSION() AS version, DATABASE() AS db, USER() AS user');
    const info = rows[0];
    console.log(`Versiya MySQL: ${info.version}`);
    console.log(`Tekushchaya BD: ${info.db}`);
    console.log(`Polzovatel: ${info.user}`);
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.log(`[OSHIBKA] Server nedostupen: ${dbConfig.host}:${dbConfig.port}`);
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log(`[OSHIBKA] Neverny parol dlya polzovatelya ${dbConfig.user}`);
    } else {
      console.log(`[OSHIBKA] ${err.code}: ${err.message}`);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('[X] Soyedineniye zakryto');
    }
  }
}

async function testPool() {
  console.log('\n=== Pul soedineniy ===');
  const pool = mysql.createPool({
    ...dbConfig,
    connectionLimit: parseInt(process.env.DB_POOL_LIMIT) || 10,
    waitForConnections: true,
    queueLimit: 0,
  });
  try {
    console.log(`[OK] Pul sozdan (limit: ${process.env.DB_POOL_LIMIT || 10})`);
    const [rows] = await pool.execute('SELECT VERSION() AS version, DATABASE() AS db');
    const info = rows[0];
    console.log(`Versiya MySQL: ${info.version}`);
    console.log(`Tekushchaya BD: ${info.db}`);
    const [status] = await pool.execute("SHOW STATUS LIKE 'Threads_connected'");
    console.log(`Soedineniy v pule: ${process.env.DB_POOL_LIMIT || 10}`);
    console.log('[OK] Pul gotov k rabote');
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.log(`[OSHIBKA] Server nedostupen: ${dbConfig.host}:${dbConfig.port}`);
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log(`[OSHIBKA] Neverny parol dlya polzovatelya ${dbConfig.user}`);
    } else {
      console.log(`[OSHIBKA] ${err.code}: ${err.message}`);
    }
  } finally {
    await pool.end();
  }
}

async function testWrongPassword() {
  console.log('\n=== Oshibka podklyucheniya (neverny parol) ===');
  try {
    const conn = await mysql.createConnection({
      ...dbConfig,
      password: 'wrong_password_123',
    });
    await conn.end();
  } catch (err) {
    console.log(`[${err.code}] ${err.message}`);
  }
}

(async () => {
  await testSingleConnection();
  await testPool();
  await testWrongPassword();
})();
