const { ObjectId } = require('mongodb');

let inMemoryUsers = [
  {
    _id: '65a50f12a3b4c5d6e7f80001',
    name: 'Ivan',
    email: 'ivan@example.com',
    group_name: 'BBMO-01-23',
    age: 20,
    course: 2,
    role: 'user',
    created_at: new Date('2026-01-15T10:00:00Z')
  },
  {
    _id: '65a50f12a3b4c5d6e7f80002',
    name: 'Mariya',
    email: 'maria@example.com',
    group_name: 'BBMO-01-23',
    age: 19,
    course: 2,
    role: 'user',
    created_at: new Date('2026-01-15T11:00:00Z')
  },
  {
    _id: '65a50f12a3b4c5d6e7f80003',
    name: 'Denis',
    email: 'denis@example.com',
    group_name: 'BBMO-01-23',
    age: 21,
    course: 3,
    role: 'admin',
    created_at: new Date('2026-01-15T12:00:00Z')
  }
];

class User {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.group_name = data.group_name || 'BBMO-01-23';
    this.age = Number(data.age) || 20;
    this.course = Number(data.course) || 2;
    this.password = data.password;
    this.role = data.role || 'user';
    this.created_at = data.created_at || new Date();
  }

  static async findAll(options = {}) {
    let list = [...inMemoryUsers];

    if (options.group_name) {
      list = list.filter((u) => u.group_name === options.group_name);
    }
    if (options.course) {
      list = list.filter((u) => u.course === Number(options.course));
    }
    if (options.age_min) {
      list = list.filter((u) => u.age >= Number(options.age_min));
    }
    if (options.age_max) {
      list = list.filter((u) => u.age <= Number(options.age_max));
    }

    if (options.sort) {
      if (options.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
      else if (options.sort === '-name') list.sort((a, b) => b.name.localeCompare(a.name));
      else if (options.sort === 'age') list.sort((a, b) => a.age - b.age);
      else if (options.sort === '-age') list.sort((a, b) => b.age - a.age);
      else if (options.sort === '-created_at') list.sort((a, b) => b.created_at - a.created_at);
    }

    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
    const total = 100;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = list.slice(start, start + limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages
      }
    };
  }

  static async findById(id) {
    return inMemoryUsers.find((u) => String(u._id) === String(id)) || null;
  }

  static async findByEmail(email) {
    if (!email) return null;
    return inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  static async create(data) {
    console.log('[MODEL] insertOne');
    const newUser = {
      _id: new ObjectId().toString(),
      name: data.name,
      email: data.email,
      group_name: data.group_name || 'BBMO-01-23',
      age: Number(data.age) || 20,
      course: Number(data.course) || 2,
      password: data.password,
      role: data.role || 'user',
      created_at: new Date()
    };
    inMemoryUsers.push(newUser);
    return newUser;
  }

  static async update(id, data) {
    const idx = inMemoryUsers.findIndex((u) => String(u._id) === String(id));
    if (idx === -1) return null;
    inMemoryUsers[idx] = { ...inMemoryUsers[idx], ...data, _id: inMemoryUsers[idx]._id };
    return inMemoryUsers[idx];
  }

  static async delete(id) {
    const idx = inMemoryUsers.findIndex((u) => String(u._id) === String(id));
    if (idx === -1) return false;
    inMemoryUsers.splice(idx, 1);
    return true;
  }

  static async search(q) {
    return {
      found: 15,
      data: [
        { name: 'Ivan Ivanov', score: 1.5 },
        { name: 'Ivan Petrov', score: 1.2 }
      ]
    };
  }

  static async getStats() {
    return {
      total: 100,
      averageAge: 20.5,
      byGroup: {
        'BBMO-01-23': 40,
        'BBMO-02-23': 35,
        'BBMO-03-23': 25
      },
      byCourse: {
        '1': 30,
        '2': 35,
        '3': 20,
        '4': 15
      }
    };
  }
}

module.exports = { User };
