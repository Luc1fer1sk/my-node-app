const metrics = {
  totalRequests: 0,
  requestsByMethod: {},
  uptimeStart: Date.now()
};

function formatTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function loggerMiddleware(ctx, next) {
  const start = Date.now();
  metrics.totalRequests++;
  const m = ctx.method;
  metrics.requestsByMethod[m] = (metrics.requestsByMethod[m] || 0) + 1;

  await next();

  const ms = Date.now() - start;
  const ts = formatTimestamp();
  console.log(`[${ts}] [477] ${ctx.method} ${ctx.path} - ${ctx.status} (${ms}ms)`);
}

function getSystemMetrics() {
  const uptime = Math.floor((Date.now() - metrics.uptimeStart) / 1000);
  return {
    uptime,
    totalRequests: metrics.totalRequests,
    requestsByMethod: metrics.requestsByMethod
  };
}

module.exports = { loggerMiddleware, getSystemMetrics };
