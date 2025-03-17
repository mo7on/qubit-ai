const supabase = require('../config/supabase');

/**
 * Database service using Supabase
 */
class DbService {
  /**
   * Execute a query on a table
   * @param {string} table - Table name
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Query result
   */
  static async query(table, options = {}) {
    try {
      let query = supabase.from(table).select(options.select || '*');
      
      // Apply filters
      if (options.filters) {
        for (const [column, value] of Object.entries(options.filters)) {
          query = query.eq(column, value);
        }
      }
      
      // Apply order
      if (options.order) {
        query = query.order(options.order.column, { 
          ascending: options.order.ascending 
        });
      }
      
      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error(`Error querying table ${table}:`, error);
      throw error;
    }
  }
  
  /**
   * Insert a record into a table
   * @param {string} table - Table name
   * @param {Object} data - Data to insert
   * @returns {Promise<Object>} - Inserted record
   */
  static async insert(table, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      
      if (error) throw error;
      
      return result[0];
    } catch (error) {
      console.error(`Error inserting into table ${table}:`, error);
      throw error;
    }
  }
  
  /**
   * Update a record in a table
   * @param {string} table - Table name
   * @param {Object} filters - Filters to identify record
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} - Updated record
   */
  static async update(table, filters, data) {
    try {
      let query = supabase.from(table).update(data);
      
      // Apply filters
      for (const [column, value] of Object.entries(filters)) {
        query = query.eq(column, value);
      }
      
      const { data: result, error } = await query.select();
      
      if (error) throw error;
      
      return result[0];
    } catch (error) {
      console.error(`Error updating table ${table}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a record from a table
   * @param {string} table - Table name
   * @param {Object} filters - Filters to identify record
   * @returns {Promise<boolean>} - Success status
   */
  static async delete(table, filters) {
    try {
      let query = supabase.from(table);
      
      // Apply filters
      for (const [column, value] of Object.entries(filters)) {
        query = query.eq(column, value);
      }
      
      const { error } = await query.delete();
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error(`Error deleting from table ${table}:`, error);
      throw error;
    }
  }
  
  /**
   * Get a record by ID
   * @param {string} table - Table name
   * @param {string|number} id - Record ID
   * @param {string} idColumn - ID column name (default: 'id')
   * @returns {Promise<Object>} - Record
   */
  static async getById(table, id, idColumn = 'id') {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(idColumn, id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error(`Error getting record by ID from table ${table}:`, error);
      throw error;
    }
  }
}

module.exports = DbService;