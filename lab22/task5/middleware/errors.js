module.exports = async function errorMiddleware(ctx, next) {
  try {
    await next();
  } catch (err) {
    const mysqlMap = {
      ER_DUP_ENTRY: 409,
      ER_NO_REFERENCED_ROW: 400,
      ER_NO_REFERENCED_ROW_2: 400,
      ECONNREFUSED: 503,
    };
    const status = mysqlMap[err.code] || err.status || 500;
    ctx.status = status;
    ctx.body = {
      error: err.message,
      code: err.code || null,
    };
  }
};
