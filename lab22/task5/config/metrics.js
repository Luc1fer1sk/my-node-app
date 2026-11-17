const metrics = {
  queries: 0,
  totalTime: 0,
  errors: 0,
  cacheHits: 0,
  cacheRequests: 0,
};

function recordQuery(ms, error = false) {
  metrics.queries++;
  metrics.totalTime += ms;
  if (error) metrics.errors++;
}

function recordCacheHit(hit) {
  metrics.cacheRequests++;
  if (hit) metrics.cacheHits++;
}

function getMetrics() {
  return {
    queries: metrics.queries,
    avgTime: metrics.queries ? parseFloat((metrics.totalTime / metrics.queries).toFixed(2)) : 0,
    errors: metrics.errors,
    cacheHitRate: metrics.cacheRequests ? parseFloat((metrics.cacheHits / metrics.cacheRequests).toFixed(2)) : 0,
  };
}

module.exports = { recordQuery, recordCacheHit, getMetrics };
