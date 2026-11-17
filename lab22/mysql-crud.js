require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'student',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bbmo_01_23',
  connectionLimit: 10,
  waitForConnections: true,
});

async function createTable() {
  console.log('=== Sozdaniye tablitsy ===');
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS students (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      group_name VARCHAR(20) NOT NULL,
      course INT NOT NULL,
      grade DECIMAL(3,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('[OK] Tablitsa students sozdana');
}

async function insertStudents() {
  console.log('\n=== INSERT ===');
  const [result1] = await pool.execute(
    'INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?)',
    ['Иван', 'ББМО-01-23', 2, 4.50]
  );
  console.log(`[OK] Vstavlen student: id=${result1.insertId}, affectedRows=${result1.affectedRows}`);

  const [result2] = await pool.execute(
    'INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)',
    [
      'Мария', 'ББМО-01-23', 2, 3.80,
      'Петр', 'ББМО-01-23', 2, 4.20,
      'Анна', 'ББМО-01-23', 2, 4.70,
    ]
  );
  console.log(`[OK] Vstavleno 3 studenta: affectedRows=${result2.affectedRows}`);
}

async function selectStudents() {
  console.log('\n=== SELECT ===');
  const [all] = await pool.execute('SELECT * FROM students');
  console.log('Vse studenty:');
  all.forEach(s => console.log(`  id=${s.id}, name=${s.name}, group=${s.group_name}, grade=${parseFloat(s.grade).toFixed(2)}`));

  const [filtered] = await pool.execute(
    'SELECT * FROM students WHERE group_name = ? ORDER BY grade DESC',
    ['ББМО-01-23']
  );
  console.log('\nStudenty gruppy BBMO-01-23 (sortirovka po grade):');
  filtered.forEach(s => console.log(`  id=${s.id}, name=${s.name}, grade=${parseFloat(s.grade).toFixed(2)}`));

  const [paged] = await pool.execute('SELECT * FROM students LIMIT ? OFFSET ?', [2, 0]);
  console.log('\nStranitsa 1 (limit=2, offset=0):');
  paged.forEach(s => console.log(`  id=${s.id}, name=${s.name}`));
}

async function updateStudent() {
  console.log('\n=== UPDATE ===');
  const [upd1] = await pool.execute(
    'UPDATE students SET grade = ? WHERE id = ?',
    [4.80, 1]
  );
  console.log(`[OK] Obnovlen student id=1: affectedRows=${upd1.affectedRows}, changedRows=${upd1.changedRows}`);

  const [upd2] = await pool.execute(
    'UPDATE students SET grade = ? WHERE id = ?',
    [4.80, 1]
  );
  console.log(`[OK] Povtornoe obnovleniye: affectedRows=${upd2.affectedRows}, changedRows=${upd2.changedRows}`);
}

async function deleteStudent() {
  console.log('\n=== DELETE ===');
  const [del] = await pool.execute('DELETE FROM students WHERE id = ?', [4]);
  console.log(`[OK] Udalen student id=4: affectedRows=${del.affectedRows}`);
}

async function sqlInjectionDemo() {
  console.log('\n=== Zashchita ot SQL-inyektsii ===');
  const maliciousInput = "'; DROP TABLE students; --";
  console.log(`Popytka inyektsii: "${maliciousInput}"`);

  const [safe] = await pool.execute(
    'SELECT * FROM students WHERE name = ?',
    [maliciousInput]
  );
  console.log(`[OK] Parametrizovannyy zapros bezopasен: naideno ${safe.length} zapisey`);
  console.log('[X] Kontsenatsiya privela by k udaleniyu tablitsy');
}

async function cleanup() {
  await pool.execute('DROP TABLE IF EXISTS students');
  await pool.end();
}

(async () => {
  try {
    await createTable();
    await insertStudents();
    await selectStudents();
    await updateStudent();
    await deleteStudent();
    await sqlInjectionDemo();
  } finally {
    await cleanup();
  }
})();
