require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'student',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bbmo_01_23',
  connectionLimit: 10,
});

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class StudentDAO {
  constructor(pool) {
    this.pool = pool;
  }

  validate(data) {
    if (!data.name || data.name.length < 2 || data.name.length > 100) {
      throw new ValidationError('name slishkom korotkoe (min. 2 simvola)');
    }
    if (!data.group_name || !/^ББМО-\d{2}-\d{2}$/.test(data.group_name)) {
      throw new ValidationError('group_name ne sootvetstvuet formatu BBMO-XX-XX');
    }
    if (!Number.isInteger(data.course) || data.course < 1 || data.course > 4) {
      throw new ValidationError('course dolzhen byt tselym ot 1 do 4');
    }
    if (data.grade !== undefined && data.grade !== null) {
      if (data.grade < 0 || data.grade > 5) {
        throw new ValidationError('grade dolzhen byt ot 0 do 5');
      }
    }
  }

  async create(data) {
    this.validate(data);
    const [result] = await this.pool.execute(
      'INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?)',
      [data.name, data.group_name, data.course, data.grade ?? null]
    );
    return { id: result.insertId, ...data };
  }

  async findById(id) {
    const [rows] = await this.pool.execute('SELECT * FROM students WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async findAll(options = {}) {
    const { limit = 10, offset = 0, group_name, course, grade_min, grade_max, sortBy = 'id', sortOrder = 'ASC' } = options;
    const allowed = ['id', 'name', 'grade', 'created_at'];
    const col = allowed.includes(sortBy) ? sortBy : 'id';
    const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    let where = [];
    let params = [];
    if (group_name) { where.push('group_name = ?'); params.push(group_name); }
    if (course) { where.push('course = ?'); params.push(course); }
    if (grade_min !== undefined) { where.push('grade >= ?'); params.push(grade_min); }
    if (grade_max !== undefined) { where.push('grade <= ?'); params.push(grade_max); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [countRows] = await this.pool.execute(`SELECT COUNT(*) AS total FROM students ${whereClause}`, params);
    const total = countRows[0].total;

    const [rows] = await this.pool.execute(
      `SELECT * FROM students ${whereClause} ORDER BY ${col} ${order} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    return { data: rows, total, currentPage, totalPages };
  }

  async update(id, data) {
    if (data.name !== undefined && (data.name.length < 2 || data.name.length > 100)) {
      throw new ValidationError('name slishkom korotkoe (min. 2 simvola)');
    }
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const [result] = await this.pool.execute(`UPDATE students SET ${fields} WHERE id = ?`, values);
    return result;
  }

  async delete(id) {
    const [result] = await this.pool.execute('DELETE FROM students WHERE id = ?', [id]);
    return result;
  }

  async search(query) {
    const [rows] = await this.pool.execute(
      'SELECT * FROM students WHERE name LIKE ?',
      [`%${query}%`]
    );
    return rows;
  }

  async getStats() {
    const [[{ total }]] = await this.pool.execute('SELECT COUNT(*) AS total FROM students');
    const [[{ avg, minG, maxG }]] = await this.pool.execute(
      'SELECT AVG(grade) AS avg, MIN(grade) AS minG, MAX(grade) AS maxG FROM students'
    );
    const [byGroup] = await this.pool.execute('SELECT group_name, COUNT(*) AS cnt FROM students GROUP BY group_name');
    const [byCourse] = await this.pool.execute('SELECT course, COUNT(*) AS cnt FROM students GROUP BY course');

    return {
      total,
      averageGrade: avg ? parseFloat(avg).toFixed(2) : null,
      minGrade: minG ? parseFloat(minG).toFixed(2) : null,
      maxGrade: maxG ? parseFloat(maxG).toFixed(2) : null,
      byGroup: Object.fromEntries(byGroup.map(r => [r.group_name, r.cnt])),
      byCourse: Object.fromEntries(byCourse.map(r => [`${r.course} kurs`, r.cnt])),
    };
  }
}

async function main() {
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

  const dao = new StudentDAO(pool);

  console.log('=== StudentDAO (gruppa BBMO-01-23) ===');

  console.log('\n--- Sozdaniye s validatsiyey ---');
  try {
    const s1 = await dao.create({ name: 'Иван', group_name: 'ББМО-01-23', course: 2, grade: 4.50 });
    console.log(`[OK] Sozdan: id=${s1.id}, name=${s1.name}`);
  } catch (e) { console.log(`[X] Oshibka: ${e.message}`); }

  try {
    await dao.create({ name: 'И', group_name: 'ББМО-01-23', course: 2 });
  } catch (e) { console.log(`[X] Oshibka: ${e.message}`); }

  try {
    await dao.create({ name: 'Мария', group_name: 'WRONG', course: 2 });
  } catch (e) { console.log(`[X] Oshibka: ${e.message}`); }

  await dao.create({ name: 'Мария', group_name: 'ББМО-01-23', course: 2, grade: 3.80 });
  await dao.create({ name: 'Петр', group_name: 'ББМО-01-23', course: 2, grade: 4.20 });
  for (let i = 1; i <= 7; i++) {
    await dao.create({ name: `Student${i}`, group_name: 'ББМО-01-23', course: i % 4 + 1, grade: Math.round((3 + Math.random() * 2) * 100) / 100 });
  }

  console.log('\n--- Paginatsiya ---');
  const page1 = await dao.findAll({ limit: 5, offset: 0 });
  console.log(`findAll({ limit: 5, offset: 0 }):`);
  console.log(`  Vsego: ${page1.total}, Stranitsa: ${page1.currentPage}/${page1.totalPages}`);
  page1.data.forEach(s => console.log(`  id=${s.id}, name=${s.name}, group=${s.group_name}, grade=${parseFloat(s.grade || 0).toFixed(2)}`));

  console.log('\n--- Filtry ---');
  const f1 = await dao.findAll({ group_name: 'ББМО-01-23', course: 2 });
  console.log(`findAll({ group_name: 'BBMO-01-23', course: 2 }): Naydeno: ${f1.total} studentov`);
  const f2 = await dao.findAll({ grade_min: 4.0, grade_max: 5.0 });
  console.log(`findAll({ grade_min: 4.0, grade_max: 5.0 }): Naydeno: ${f2.total} studentov`);

  console.log('\n--- Poisk ---');
  const found = await dao.search('Иван');
  console.log(`search('Ivan'): Naydeno: ${found.length} studentov`);
  found.forEach(s => console.log(`  id=${s.id}, name=${s.name}`));

  console.log('\n--- Statistika ---');
  const stats = await dao.getStats();
  console.log(`Vsego studentov:        ${stats.total}`);
  console.log(`Sredniy ball:           ${stats.averageGrade}`);
  console.log(`Minimalnaya otsenka:    ${stats.minGrade}`);
  console.log(`Maximalnaya otsenka:    ${stats.maxGrade}`);
  console.log('Po gruppam:');
  Object.entries(stats.byGroup).forEach(([g, c]) => console.log(`  ${g}: ${c}`));
  console.log('Po kursam:');
  Object.entries(stats.byCourse).forEach(([c, n]) => console.log(`  ${c}: ${n}`));

  await pool.execute('DROP TABLE IF EXISTS students');
  await pool.end();
}

main();
