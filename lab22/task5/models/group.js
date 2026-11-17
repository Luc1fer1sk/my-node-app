const { query } = require('./db');

class GroupModel {
  async findAll() {
    const [rows] = await query('SELECT DISTINCT group_name FROM students ORDER BY group_name');
    return rows.map(r => r.group_name);
  }

  async getStudentsByGroup(groupName) {
    const [rows] = await query('SELECT * FROM students WHERE group_name = ?', [groupName]);
    return rows;
  }

  async create(groupName) {
    return { group_name: groupName, created: true };
  }
}

module.exports = new GroupModel();
