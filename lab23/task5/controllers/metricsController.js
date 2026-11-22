const { getMetrics } = require('../middleware/logger');

async function metrics(ctx) {
  ctx.body = getMetrics();
}

module.exports = { metrics };
