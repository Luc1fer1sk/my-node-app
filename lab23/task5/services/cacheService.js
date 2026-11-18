class CacheService {
  constructor(ttlSeconds = 60) {
    this.ttl = ttlSeconds * 1000;
    this.cache = new Map();
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl
    });
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new CacheService();

module.exports = { cache };
