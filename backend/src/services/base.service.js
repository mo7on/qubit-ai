const logger = require('../utils/logger');
const { performance } = require('perf_hooks');

class BaseService {
  /**
   * Generate a unique request ID
   * @returns {string} - Unique request ID
   */
  static generateRequestId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  /**
   * Measure execution time of an async function
   * @param {Function} asyncFn - Async function to measure
   * @param {Array} args - Arguments to pass to the function
   * @returns {Promise<Object>} - Result with execution time
   */
  static async measureExecutionTime(asyncFn, ...args) {
    const startTime = performance.now();
    try {
      const result = await asyncFn(...args);
      const duration = ((performance.now() - startTime) / 1000).toFixed(2);
      return { result, duration };
    } catch (error) {
      const duration = ((performance.now() - startTime) / 1000).toFixed(2);
      throw { error, duration };
    }
  }
  
  /**
   * Log method execution with timing
   * @param {string} methodName - Name of the method being executed
   * @param {Function} method - Method to execute
   * @param {Array} args - Arguments to pass to the method
   * @returns {Promise<any>} - Result of the method
   */
  static async logExecution(methodName, method, ...args) {
    const requestId = this.generateRequestId();
    logger.info(`[${requestId}] Starting ${methodName}`);
    
    try {
      const { result, duration } = await this.measureExecutionTime(method, ...args);
      logger.info(`[${requestId}] Completed ${methodName} in ${duration}s`);
      return result;
    } catch ({ error, duration }) {
      logger.error(`[${requestId}] Error in ${methodName} (${duration}s): ${error.message}`, { error });
      throw error;
    }
  }
}

module.exports = BaseService;