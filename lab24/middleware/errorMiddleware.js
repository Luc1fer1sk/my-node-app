async function errorMiddleware(ctx, next) {
  try {
    ctx.set('X-Group', 'BBMO-01-23');
    await next();
  } catch (err) {
    ctx.set('X-Group', 'BBMO-01-23');
    ctx.status = err.status || 500;

    if (err.isJoi || err.details) {
      ctx.status = 400;
      ctx.body = {
        error: 'Validation failed',
        details: err.details
      };
      return;
    }

    ctx.body = {
      error: err.message || 'Vnutrennyaya oshibka servera',
      status: ctx.status
    };
  }
}

module.exports = { errorMiddleware };
