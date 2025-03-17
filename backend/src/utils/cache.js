const NodeCache = require('node-cache');
const logger = require('./logger');

// Create cache instance with default TTL of 1 hour
const cache = new NodeCache({
  stdTTL: 3600, // 1 hour in seconds
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false
});

// Log cache statistics periodically
setInterval(() => {
  const stats = cache.getStats();
  logger.debug(`Cache stats - Keys: ${cache.keys().length}, Hits: ${stats.hits}, Misses: ${stats.misses}, Hit Rate: ${stats.hits / (stats.hits + stats.misses || 1) * 100}%`);
}, 300000); // Every 5 minutes

module.exports = {
  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Cached value or null
   */
  get: (key) => {
    return new Promise((resolve) => {
      const value = cache.get(key);
      resolve(value);
    });
  },
  
  /**
   * Set a value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {Promise<boolean>} - Success status
   */
  set: (key, value, ttl) => {
    return new Promise((resolve) => {
      const success = cache.set(key, value, ttl);
      resolve(success);
    });
  },
  
  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   * @returns {Promise<number>} - Number of deleted entries
   */
  del: (key) => {
    return new Promise((resolve) => {
      const deleted = cache.del(key);
      resolve(deleted);
    });
  },
  
  /**
   * Flush the entire cache
   * @returns {Promise<void>}
   */
  flush: () => {
    return new Promise((resolve) => {
      cache.flushAll();
      resolve();
    });
  }
};