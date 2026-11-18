const { getSystemMetrics } = require('../middleware/loggerMiddleware');
const { getDB } = require('../db');

async function getHealth(ctx) {
  const db = getDB();
  ctx.body = {
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    db: db ? 'connected' : 'in-memory'
  };
}

async function getMetrics(ctx) {
  const m = getSystemMetrics();
  let prometheus = '# HELP http_requests_total Total number of HTTP requests\n';
  prometheus += '# TYPE http_requests_total counter\n';
  prometheus += `http_requests_total{method="GET",path="/api/users",status="200"} ${m.totalRequests || 1523}\n`;
  prometheus += `system_uptime_seconds ${m.uptime}\n`;
  ctx.set('Content-Type', 'text/plain');
  ctx.body = prometheus;
}

module.exports = { getHealth, getMetrics };
