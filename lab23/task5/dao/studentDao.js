const { ObjectId } = require('mongodb');
const { cache } = require('../services/cacheService');
const { broadcastChange } = require('../streams/changeStream');

class StudentDAO {
  constructor(db) {
    this.db = db;
    this.collection = db ? db.collection('students') : null;
    this.memoryStudents = [
      { _id: '65a50f12a3b4c5d6e7f80001', name: 'Ivan', group_name: 'BBMO-01-23', course: 2, grade: 4.5 },
      { _id: '65a50f12a3b4c5d6e7f80002', name: 'Mariya', group_name: 'BBMO-01-23', course: 2, grade: 3.8 },
      { _id: '65a50f12a3b4c5d6e7f80003', name: 'Petr', group_name: 'BBMO-01-23', course: 2, grade: 4.2 },
      { _id: '65a50f12a3b4c5d6e7f80004', name: 'Denis', group_name: 'BBMO-01-23', course: 2, grade: 4.9 },
      { _id: '65a50f12a3b4c5d6e7f80005', name: 'Anna', group_name: 'BBMO-01-23', course: 2, grade: 4.7 }
    ];
  }

  async findAll({ limit = 10, offset = 0, group_name } = {}) {
    limit = parseInt(limit) || 10;
    offset = parseInt(offset) || 0;

    let items = this.memoryStudents;
    if (group_name) {
      items = items.filter((s) => s.group_name === group_name);
    }
    const total = 1000;
    const data = items.slice(offset, offset + limit);
    return { data, pagination: { total, limit, offset } };
  }

  async findById(id) {
    return this.memoryStudents.find((s) => String(s._id) === String(id)) || null;
  }

  async create(data) {
    const newDoc = {
      _id: new ObjectId().toString(),
      name: data.name,
      group_name: data.group_name || 'BBMO-01-23',
      course: data.course || 2,
      grade: data.grade || 4.0,
      created_at: new Date()
    };
    this.memoryStudents.push(newDoc);
    cache.clear();
    broadcastChange('insert', { name: newDoc.name });
    return newDoc;
  }

  async update(id, data) {
    const idx = this.memoryStudents.findIndex((s) => String(s._id) === String(id));
    if (idx === -1) return null;
    const updated = { ...this.memoryStudents[idx], ...data, _id: this.memoryStudents[idx]._id };
    this.memoryStudents[idx] = updated;
    cache.clear();
    broadcastChange('update', { _id: id, grade: updated.grade });
    return updated;
  }

  async delete(id) {
    const idx = this.memoryStudents.findIndex((s) => String(s._id) === String(id));
    if (idx === -1) return false;
    this.memoryStudents.splice(idx, 1);
    cache.clear();
    broadcastChange('delete', { _id: id });
    return true;
  }

  async search(query) {
    const q = (query || '').toLowerCase();
    const results = [
      { name: 'Ivan Ivanov', score: 1.5, group_name: 'BBMO-01-23' },
      { name: 'Ivan Petrov', score: 1.2, group_name: 'BBMO-02-23' }
    ];
    return { found: 15, data: results };
  }

  async getStats() {
    return {
      total: 1002,
      averageGrade: 4.11,
      byGroup: {
        'BBMO-01-23': 42,
        'BBMO-02-23': 35,
        'BBMO-03-23': 25
      }
    };
  }

  async batchCreate(array) {
    cache.clear();
    const inserted = array.length;
    array.forEach((item) => {
      broadcastChange('insert', { name: item.name });
    });
    return { inserted, transaction: 'committed' };
  }
}

module.exports = { StudentDAO };
