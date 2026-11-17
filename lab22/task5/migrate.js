require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('./config');

const migrationsDir = path.join(__dirname, 'migrations');

async function runMigrations(direction = 'up') {
  const pool = mysql.createPool(config.db);
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    if (direction === 'up') {
      const [[...applied]] = await pool.execute('SELECT name FROM migrations');
      const appliedNames = applied.map(r => r.name);
      let count = 0;
      for (const file of files) {
        if (!appliedNames.includes(file)) {
          const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
          await pool.execute(sql);
          await pool.execute('INSERT INTO migrations (name) VALUES (?)', [file]);
          console.log(`[MIGRATE] Primenena: ${file}`);
          count++;
        }
      }
      console.log(`[INFO] Migracii primenieny: ${count}`);
    } else {
      const [[...applied]] = await pool.execute('SELECT name FROM migrations ORDER BY applied_at DESC LIMIT 1');
      if (applied.length) {
        const last = applied[0].name;
        const rollback = last.replace('.sql', '_rollback.sql');
        const rollbackPath = path.join(migrationsDir, rollback);
        if (fs.existsSync(rollbackPath)) {
          const sql = fs.readFileSync(rollbackPath, 'utf8');
          await pool.execute(sql);
        } else {
          const tableName = last.replace(/^\d+_create_/, '').replace('.sql', '');
          await pool.execute(`DROP TABLE IF EXISTS ${tableName}`);
        }
        await pool.execute('DELETE FROM migrations WHERE name = ?', [last]);
        console.log(`[MIGRATE] Otkachena: ${last}`);
      }
    }
  } finally {
    await pool.end();
  }
}

const direction = process.argv[2] || 'up';
runMigrations(direction);
