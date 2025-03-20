const supabase = require('../config/supabase');
const { handleSupabaseError } = require('../utils/supabase-helpers');

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
      
      // Insert data using Supabase
      const { data: history, error } = await supabase
        .from('histories')
        .insert({
          user_id: userId,
          action,
          entity_type: entityType,
          entity_id: entityId,
          details,
          ip_address: ipAddress,
          user_agent: userAgent
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      return false;
    }
  }
  
  static async getUserHistory(userId, options = {}) {
    try {
      const { limit = 50, offset = 0, action, entityType } = options;
      
      // Build query with Supabase
      let query = supabase
        .from('histories')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (action) {
        query = query.eq('action', action);
      }
      
      if (entityType) {
        query = query.eq('entity_type', entityType);
      }
      
      const { data, count, error } = await query;
      
      if (error) throw error;
      
      return {
        rows: data,
        count
      };
    } catch (error) {
      console.error('Error fetching user history:', error);
      throw error;
    }
  }
}

module.exports = HistoryService;