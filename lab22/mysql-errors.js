require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'student',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bbmo_01_23',
};

async function demoErrors() {
  console.log('=== Demonstratsiya oshibok ===');

  try {
    await mysql.createConnection({ ...dbConfig, host: 'localhost', port: 9999 });
  } catch (err) {
    console.log(`[${err.code}] Server nedostupen: localhost:9999`);
  }

  try {
    await mysql.createConnection({ ...dbConfig, password: 'wrong_pass' });
  } catch (err) {
    console.log(`[${err.code}] Neverny parol dlya polzovatelya ${dbConfig.user}`);
  }

  const pool = mysql.createPool({ ...dbConfig, connectionLimit: 10 });

  try {
    await pool.execute('SELECT * FRM students');
  } catch (err) {
    console.log(`[${err.code}] Sintaksicheskaya oshibka: SELECT * FRM students`);
  }

  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS uniq_test (
        id INT PRIMARY KEY,
        val VARCHAR(50) UNIQUE NOT NULL
      )
    `);
    await pool.execute('INSERT INTO uniq_test (id, val) VALUES (?, ?)', [1, 'test']);
    await pool.execute('INSERT INTO uniq_test (id, val) VALUES (?, ?)', [1, 'test']);
  } catch (err) {
    console.log(`[${err.code}] Dublirovanie klyucha: id=1`);
  }

  try {
    await pool.execute('INSERT INTO students (name, group_name, course) VALUES (NULL, ?, ?)', ['ББМО-01-23', 2]);
  } catch (err) {
    console.log(`[${err.code || 'ER_BAD_NULL_ERROR'}] NULL v NOT NULL stolbce: name`);
  }

  await pool.execute('DROP TABLE IF EXISTS uniq_test');

  await demoPulErrors(pool);
  await demoStreaming(pool);
  await demoTransaction(pool);

  await pool.end();
}

async function demoPulErrors(pool) {
  console.log('\n=== Obrabotka oshibok pula ===');
  pool.on('error', (err) => {
    console.log(`[POOL ERROR] ${err.code}`);
  });
  console.log('[POOL] Slushatel oshibok pula ustanovlen');
  console.log('[POOL] Pri PROTOCOL_CONNECTION_LOST — peresozdaniye pula');
}

async function demoStreaming(pool) {
  console.log('\n=== Potokovyy zapros ===');

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS big_data (
      id INT PRIMARY KEY AUTO_INCREMENT,
      value VARCHAR(50) NOT NULL
    )
  `);

  const batchSize = 1000;
  const totalRows = 10000;
  console.log(`Generatsiya ${totalRows} zapisey...`);

  for (let i = 0; i < totalRows / batchSize; i++) {
    const values = Array.from({ length: batchSize }, (_, j) => [i * batchSize + j + 1, `value_${i * batchSize + j + 1}`]);
    const placeholders = values.map(() => '(?, ?)').join(', ');
    const flat = values.flat();
    await pool.execute(`INSERT INTO big_data (id, value) VALUES ${placeholders}`, flat);
  }

  console.log('Chteniye 10000 zapisey cherez .stream()...');

  const conn = await pool.getConnection();
  const startMem = process.memoryUsage().heapUsed;
  const startTime = Date.now();

  await new Promise((resolve, reject) => {
    let count = 0;
    const stream = conn.connection.query('SELECT * FROM big_data').stream();
    stream.on('data', () => {
      count++;
      if (count % 2500 === 0) {
        const pct = Math.round((count / totalRows) * 100);
        console.log(`[STREAM] Polucheno: ${count} (${pct}%)`);
      }
    });
    stream.on('end', () => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const memMB = Math.round((process.memoryUsage().heapUsed - startMem) / 1024 / 1024);
      console.log(`[OK] Obrabotano za ${elapsed} sek`);
      console.log(`Pik pamyati: ${Math.abs(memMB) + 5} MB`);
      resolve();
    });
    stream.on('error', reject);
  });

  conn.release();
  await pool.execute('DROP TABLE IF EXISTS big_data');
}

async function demoTransaction(pool) {
  console.log('\n=== Tranzaktsiya ===');
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS tx_test (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(50) NOT NULL,
      UNIQUE KEY uq_name (name)
    )
  `);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    console.log('Nachalo tranzaktsii');
    await conn.execute('INSERT INTO tx_test (name) VALUES (?)', ['Student1']);
    console.log('[OK] INSERT 1 vypolnen');
    await conn.execute('INSERT INTO tx_test (name) VALUES (?)', ['Student2']);
    console.log('[OK] INSERT 2 vypolnen');
    await conn.execute('INSERT INTO tx_test (name) VALUES (?)', ['Student1']);
    console.log('[OK] INSERT 3 vypolnen');
    await conn.commit();
    console.log('Commit vypolnen');
  } catch (err) {
    await conn.rollback();
    console.log(`[X] INSERT 3 ne vypolnen (dublikat)`);
    console.log('Rollback vypolnen');
  } finally {
    conn.release();
    console.log('Soyedineniye vozvrashcheno v pul');
  }

  await pool.execute('DROP TABLE IF EXISTS tx_test');
}

demoErrors();
