const cache = new Map();

function get(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function set(key, value, ttlMs = 60000) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function invalidate(pattern) {
  for (const key of cache.keys()) {
    if (key.startsWith(pattern)) cache.delete(key);
  }
}

function getStats() {
  const now = Date.now();
  let alive = 0;
  for (const entry of cache.values()) {
    if (now <= entry.expiresAt) alive++;
  }
  return { size: cache.size, alive, ttl: 60 };
}

module.exports = { get, set, invalidate, getStats };
