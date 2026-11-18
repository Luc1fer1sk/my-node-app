const ipCounts = new Map();

async function rateLimitMiddleware(ctx, next) {
  const ip = ctx.ip || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60000;
  const max = 100;

  let record = ipCounts.get(ip);
  if (!record || now - record.startTime > windowMs) {
    record = { count: 1, startTime: now };
    ipCounts.set(ip, record);
  } else {
    record.count++;
  }

  ctx.set('X-RateLimit-Limit', String(max));
  ctx.set('X-RateLimit-Remaining', String(Math.max(0, max - record.count)));

  if (record.count > max) {
    ctx.status = 429;
    ctx.body = { error: 'Too Many Requests', status: 429 };
    return;
  }

  await next();
}

module.exports = { rateLimitMiddleware };
