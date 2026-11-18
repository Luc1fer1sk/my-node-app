async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: true,
      message: err.message || 'Vnutrennyaya oshibka servera'
    };
    console.error(`[ERR] ${ctx.status}: ${err.message}`);
  }
}

module.exports = { errorHandler };
