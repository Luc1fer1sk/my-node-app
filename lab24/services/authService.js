const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_bbmo_01_23';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecretrefreshjwtkey_bbmo_01_23';

class AuthService {
  generateTokens(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role || 'user'
    };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken, expiresIn: 900 };
  }

  async register(data) {
    const existing = await User.findByEmail(data.email);
    if (existing) {
      const err = new Error('Email already exists');
      err.status = 409;
      throw err;
    }
    const hashedPassword = await bcrypt.hash(data.password || 'secret123', 10);
    const user = await User.create({
      ...data,
      password: hashedPassword
    });
    const tokens = this.generateTokens(user);
    return {
      data: { userId: user._id, email: user.email },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }

  async login(email, password) {
    console.log(`[AUTH] Popytka vhoda: ${email}`);
    const user = await User.findByEmail(email);
    if (!user || !user.password) {
      console.log(`[AUTH] Sboy autentifikacii dlya ${email}: polzovatel ne nayden`);
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log(`[AUTH] Sboy autentifikacii dlya ${email}: neverny parol`);
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }
    console.log(`[AUTH] Uspeshny vhod: ${email}`);
    return this.generateTokens(user);
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      const err = new Error('Refresh token obyazatelen');
      err.status = 401;
      throw err;
    }
    try {
      const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      const user = await User.findById(payload.userId);
      if (!user) {
        const err = new Error('Polzovatel ne nayden');
        err.status = 401;
        throw err;
      }
      return this.generateTokens(user);
    } catch (e) {
      const err = new Error('Neverny ili istekshiy refresh token');
      err.status = 401;
      throw err;
    }
  }
}

const authService = new AuthService();

module.exports = { authService, AuthService, JWT_SECRET, JWT_REFRESH_SECRET };
