const { getMetrics } = require('../config/metrics');
const cache = require('../services/cache');

const metricsController = {
  async get(ctx) {
    ctx.body = getMetrics();
  },
  async cacheStats(ctx) {
    ctx.body = cache.getStats();
  },
};

module.exports = metricsController;
