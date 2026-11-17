const { query, getConnection } = require('./db');
const { recordQuery } = require('../config/metrics');

class StudentModel {
  async findAll({ limit = 10, offset = 0 } = {}) {
    const [[{ total }]] = await query('SELECT COUNT(*) AS total FROM students');
    const [rows] = await query('SELECT * FROM students LIMIT ? OFFSET ?', [limit, offset]);
    return { data: rows, total, limit, offset, pages: Math.ceil(total / limit) };
  }

  async findById(id) {
    const [rows] = await query('SELECT * FROM students WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async create(data) {
    const { name, group_name, course, grade } = data;
    const [result] = await query(
      'INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?)',
      [name, group_name, course, grade ?? null]
    );
    return this.findById(result.insertId);
  }

  async update(id, data) {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(data), id];
    await query(`UPDATE students SET ${fields} WHERE id = ?`, values);
    return this.findById(id);
  }

  async delete(id) {
    const [result] = await query('DELETE FROM students WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  async getStats() {
    const [[{ total, avg, minG, maxG }]] = await query(
      'SELECT COUNT(*) AS total, AVG(grade) AS avg, MIN(grade) AS minG, MAX(grade) AS maxG FROM students'
    );
    const [byGroup] = await query('SELECT group_name, COUNT(*) AS cnt FROM students GROUP BY group_name');
    return {
      total,
      averageGrade: avg ? parseFloat(avg).toFixed(2) : null,
      byGroup: Object.fromEntries(byGroup.map(r => [r.group_name, r.cnt])),
    };
  }

  async createBatch(students) {
    const conn = await getConnection();
    try {
      await conn.beginTransaction();
      const start = Date.now();
      console.log(`[${new Date().toISOString().slice(0, 19).replace('T', ' ')}] [BBMO-01-23] BEGIN TRANSACTION`);
      const ids = [];
      for (const s of students) {
        const [r] = await conn.execute(
          'INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?)',
          [s.name, s.group_name, s.course, s.grade ?? null]
        );
        recordQuery(Date.now() - start);
        ids.push(r.insertId);
        const ms = Date.now() - start;
        console.log(`[${new Date().toISOString().slice(0, 19).replace('T', ' ')}] [BBMO-01-23] INSERT INTO students ... (${ms}ms)`);
      }
      await conn.commit();
      console.log(`[${new Date().toISOString().slice(0, 19).replace('T', ' ')}] [BBMO-01-23] COMMIT`);
      return ids;
    } catch (err) {
      await conn.rollback();
      console.log(`[${new Date().toISOString().slice(0, 19).replace('T', ' ')}] [BBMO-01-23] ROLLBACK`);
      throw err;
    } finally {
      conn.release();
    }
  }
}

module.exports = new StudentModel();
