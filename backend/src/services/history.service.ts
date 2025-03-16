const db = require('../models');
const History = db.History;

class HistoryService {
  static async logActivity(data) {
    try {
      const {
        userId,
        action,
        entityType,
        entityId,
        details,
        ipAddress,
        userAgent
      } = data;
      
      await History.create({
        userId,
        action,
        entityType,
        entityId,
        details,
        ipAddress,
        userAgent
      });
      
      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      return false;
    }
  }
  
  static async getUserHistory(userId, options = {}) {
    try {
      const { limit = 50, offset = 0, action, entityType } = options;
      
      const query = { userId };
      
      if (action) {
        query.action = action;
      }
      
      if (entityType) {
        query.entityType = entityType;
      }
      
      const history = await History.findAndCountAll({
        where: query,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });
      
      return history;
    } catch (error) {
      console.error('Error fetching user history:', error);
      throw error;
    }
  }
}

module.exports = HistoryService;