// ============================================================================
// CACHING SERVICE - Intelligent Data Caching & Performance Optimization
// ============================================================================

class CacheService {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.accessCount = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    this.maxSize = 100; // Maximum cache entries
    this.hitCount = 0;
    this.missCount = 0;

    // Periodic cleanup
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  // Generate cache key
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});
    
    return `${url}:${JSON.stringify(sortedParams)}`;
  }

  // Set cache entry
  set(key, data, ttl = this.defaultTTL) {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      ttl,
      size: JSON.stringify(data).length
    });
    
    this.timestamps.set(key, Date.now());
    this.accessCount.set(key, 0);
  }

  // Get cache entry
  get(key) {
    if (!this.cache.has(key)) {
      this.missCount++;
      return null;
    }

    const entry = this.cache.get(key);
    const timestamp = this.timestamps.get(key);
    const age = Date.now() - timestamp;

    // Check if entry is expired
    if (age > entry.ttl) {
      this.delete(key);
      this.missCount++;
      return null;
    }

    // Update access count and timestamp
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    this.timestamps.set(key, Date.now());
    this.hitCount++;

    return entry.data;
  }

  // Delete cache entry
  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
    this.accessCount.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.timestamps.clear();
    this.accessCount.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  // Evict least recently used entry
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();

    this.timestamps.forEach((timestamp, key) => {
      if (timestamp < oldestTime) {
        oldestTime = timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    const toDelete = [];

    this.cache.forEach((entry, key) => {
      const timestamp = this.timestamps.get(key);
      if (now - timestamp > entry.ttl) {
        toDelete.push(key);
      }
    });

    toDelete.forEach(key => this.delete(key));

    if (toDelete.length > 0) {
      console.log(`🧹 Cache cleanup: removed ${toDelete.length} expired entries`);
    }
  }

  // Get cache statistics
  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;
    const totalSize = Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.size, 0);

    return {
      entries: this.cache.size,
      maxSize: this.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: hitRate.toFixed(2) + '%',
      totalSize: (totalSize / 1024).toFixed(2) + ' KB',
      oldestEntry: this.getOldestEntry(),
      mostAccessed: this.getMostAccessedEntry()
    };
  }

  // Get oldest cache entry
  getOldestEntry() {
    let oldestKey = null;
    let oldestTime = Date.now();

    this.timestamps.forEach((timestamp, key) => {
      if (timestamp < oldestTime) {
        oldestTime = timestamp;
        oldestKey = key;
      }
    });

    return oldestKey ? {
      key: oldestKey,
      age: Date.now() - oldestTime
    } : null;
  }

  // Get most accessed entry
  getMostAccessedEntry() {
    let mostAccessedKey = null;
    let maxAccess = 0;

    this.accessCount.forEach((count, key) => {
      if (count > maxAccess) {
        maxAccess = count;
        mostAccessedKey = key;
      }
    });

    return mostAccessedKey ? {
      key: mostAccessedKey,
      accessCount: maxAccess
    } : null;
  }

  // Preload cache with critical data
  async preload(criticalEndpoints) {
    console.log('🚀 Preloading cache with critical data...');
    
    for (const endpoint of criticalEndpoints) {
      try {
        // Import API service to use proper backend endpoints
        const { api } = await import('./api.js');
        
        // Use the API service instead of direct fetch to relative URLs
        const data = await api.get(endpoint.url);
        
        this.set(
          this.generateKey(endpoint.url, endpoint.params),
          data,
          endpoint.ttl || this.defaultTTL
        );
      } catch (error) {
        console.warn(`⚠️ Failed to preload ${endpoint.url}:`, error);
        // For missing endpoints, store a placeholder to prevent repeated requests
        this.set(
          this.generateKey(endpoint.url, endpoint.params),
          { error: 'Endpoint not implemented', available: false },
          300000 // Cache error state for 5 minutes
        );
      }
    }
  }

  // Smart cache invalidation
  invalidatePattern(pattern) {
    const keysToDelete = [];
    
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.delete(key));
    
    console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
  }
}

// Create singleton instance
const cacheService = new CacheService();

export default cacheService;
