const bcrypt = require('bcryptjs');
const { User } = require('../models/user');

class UserService {
  async getAllUsers(options) {
    return await User.findAll(options);
  }

  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return user;
  }

  async createUser(userData) {
    console.log(`[SERVICE] Sozdanie polzovatelya: ${userData.email}`);
    console.log('[SERVICE] Proverka unikalnosti email');

    const existing = await User.findByEmail(userData.email);
    if (existing) {
      console.log('[SERVICE] Email uzhe sushchestvuet');
      const err = new Error('Email already exists');
      err.status = 409;
      throw err;
    }

    let hashedPassword = userData.password;
    if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, 10);
    }

    const created = await User.create({
      ...userData,
      password: hashedPassword
    });

    console.log(`[SERVICE] Email otpravlen: ${userData.email}`);
    return created;
  }

  async updateUser(id, updateData) {
    const user = await User.findById(id);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    if (updateData.email && updateData.email !== user.email) {
      const existing = await User.findByEmail(updateData.email);
      if (existing) {
        const err = new Error('Email already exists');
        err.status = 409;
        throw err;
      }
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    return await User.update(id, updateData);
  }

  async deleteUser(id) {
    const user = await User.findById(id);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return await User.delete(id);
  }

  async searchUsers(query) {
    return await User.search(query);
  }

  async getStats() {
    return await User.getStats();
  }

  async exportCSV() {
    const { data } = await User.findAll({ limit: 100 });
    const header = 'id,name,email,group_name,age,course\n';
    const rows = data.map((u) => `${u._id},${u.name},${u.email},${u.group_name},${u.age},${u.course}`).join('\n');
    return header + rows;
  }
}

const userService = new UserService();

module.exports = { userService, UserService };
