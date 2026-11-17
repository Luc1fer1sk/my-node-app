module.exports = async function loggerMiddleware(ctx, next) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`[${new Date().toISOString().slice(0, 19).replace('T', ' ')}] ${ctx.method} ${ctx.url} -> ${ctx.status} (${ms}ms)`);
};
