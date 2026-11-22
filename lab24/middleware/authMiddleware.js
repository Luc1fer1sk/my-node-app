const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../services/authService');

async function authMiddleware(ctx, next) {
  const header = ctx.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized', status: 401 };
    return;
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    ctx.user = payload;
    await next();
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized', status: 401 };
  }
}

function requireRole(role) {
  return async (ctx, next) => {
    if (!ctx.user || ctx.user.role !== role) {
      ctx.status = 403;
      ctx.body = { error: `Forbidden: ${role} role required`, status: 403 };
      return;
    }
    await next();
  };
}

module.exports = { authMiddleware, requireRole };
