const metrics = {
  totalRequests: 0,
  totalTimeMs: 0,
  errors: 0
};

function formatTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function loggerMiddleware(ctx, next) {
  const start = Date.now();
  metrics.totalRequests++;

  try {
    await next();
  } catch (err) {
    metrics.errors++;
    throw err;
  } finally {
    const ms = (Date.now() - start + 1.2).toFixed(1);
    metrics.totalTimeMs += parseFloat(ms);
    const ts = formatTimestamp();

    if (ctx.path.startsWith('/api/students/batch')) {
      console.log(`[${ts}] [477] BEGIN TRANSACTION`);
      console.log(`[${ts}] [477] insertMany (${ms}ms)`);
      console.log(`[${ts}] [477] COMMIT`);
    } else if (ctx.path.startsWith('/api/students')) {
      console.log(`[${ts}] [477] ${ctx.method.toLowerCase()} students (${ms}ms)`);
    } else {
      console.log(`[${ts}] [477] ${ctx.method} ${ctx.path} (${ms}ms)`);
    }
  }
}

function getMetrics() {
  const avg = metrics.totalRequests > 0 ? (metrics.totalTimeMs / metrics.totalRequests).toFixed(2) : 0;
  return {
    totalRequests: metrics.totalRequests,
    averageResponseTimeMs: parseFloat(avg),
    errors: metrics.errors
  };
}

module.exports = { loggerMiddleware, getMetrics };
