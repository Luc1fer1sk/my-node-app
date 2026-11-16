const { getPool } = require('../config/database');

module.exports = async function dbMiddleware(ctx, next) {
  ctx.db = getPool();
  await next();
};
