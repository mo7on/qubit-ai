const supabase = require('../config/supabase');

/**
 * Database service for Supabase
 */
class DatabaseService {
  /**
   * User Login operations
   */
  static userLogin = {
    // Get user by email
    getByEmail: async (email) => {
      const { data, error } = await supabase
        .from('user_login')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    // Create new user
    create: async (userData) => {
      const { data, error } = await supabase
        .from('user_login')
        .insert(userData)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    
    // Update user
    update: async (userId, userData) => {
      const { data, error } = await supabase
        .from('user_login')
        .update(userData)
        .eq('id', userId)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    
    // Get user by ID
    getById: async (userId) => {
      const { data, error } = await supabase
        .from('user_login')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    }
  };
  
  /**
   * User Device operations
   */
  static userDevice = {
    // Get devices by user ID
    getByUserId: async (userId) => {
      const { data, error } = await supabase
        .from('user_device')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    },
    
    // Add new device
    create: async (deviceData) => {
      const { data, error } = await supabase
        .from('user_device')
        .insert(deviceData)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    
    // Update device
    update: async (deviceId, deviceData) => {
      const { data, error } = await supabase
        .from('user_device')
        .update(deviceData)
        .eq('id', deviceId)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    
    // Delete device
    delete: async (deviceId) => {
      const { error } = await supabase
        .from('user_device')
        .delete()
        .eq('id', deviceId);
      
      if (error) throw error;
      return true;
    }
  };
  
  /**
   * Conversation operations
   */
  static conversation = {
    // Get conversations by user ID
    getByUserId: async (userId) => {
      const { data, error } = await supabase
        .from('conversation')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    
    // Create new conversation
    create: async (conversationData) => {
      const { data, error } = await supabase
        .from('conversation')
        .insert(conversationData)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    
    // Get conversation by ID
    getById: async (conversationId) => {
      const { data, error } = await supabase
        .from('conversation')
        .select('*')
        .eq('id', conversationId)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    // Update conversation
    update: async (conversationId, conversationData) => {
      const { data, error } = await supabase
        .from('conversation')
        .update(conversationData)
        .eq('id', conversationId)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    
    // Delete conversation
    delete: async (conversationId) => {
      const { error } = await supabase
        .from('conversation')
        .delete()
        .eq('id', conversationId);
      
      if (error) throw error;
      return true;
    }
  };
  
  /**
   * Message operations
   */
  static message = {
    // Get messages by conversation ID
    getByConversationId: async (conversationId) => {
      const { data, error } = await supabase
        .from('message')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    
    // Create new message
    create: async (messageData) => {
      // Updated to use message_content instead of content
      return await supabase
        .from('message')
        .insert(messageData)
        .select()
        .then(({ data, error }) => {
          if (error) throw error;
          return data[0];
        });
    },
    
    // Get message by ID
    getById: async (messageId) => {
      const { data, error } = await supabase
        .from('message')
        .select('*')
        .eq('id', messageId)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    // Update message
    update: async (messageId, messageData) => {
      const { data, error } = await supabase
        .from('message')
        .update(messageData)
        .eq('id', messageId)
        .select();
      
      if (error) throw error;
      return data[0];
    }
  };
  
  /**
   * Message Feedback operations
   */
  static messageFeedback = {
    // Get feedback by message ID
    getByMessageId: async (messageId) => {
      const { data, error } = await supabase
        .from('message_feedback')
        .select('*')
        .eq('message_id', messageId);
      
      if (error) throw error;
      return data;
    },
    
    // Create new feedback
    create: async (feedbackData) => {
      const { data, error } = await supabase
        .from('message_feedback')
        .insert(feedbackData)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    
    // Update feedback
    update: async (feedbackId, feedbackData) => {
      const { data, error } = await supabase
        .from('message_feedback')
        .update(feedbackData)
        .eq('id', feedbackId)
        .select();
      
      if (error) throw error;
      return data[0];
    }
  };
  
  /**
   * Conversation History operations
   */
  static conversationHistory = {
    // Get history by user ID
    getByUserId: async (userId) => {
      const { data, error } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    
    // Create new history entry
    create: async (historyData) => {
      const { data, error } = await supabase
        .from('conversation_history')
        .insert(historyData)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    
    // Get history by ID
    getById: async (historyId) => {
      const { data, error } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('id', historyId)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    // Delete history entry
    delete: async (historyId) => {
      const { error } = await supabase
        .from('conversation_history')
        .delete()
        .eq('id', historyId);
      
      if (error) throw error;
      return true;
    }
  };
  
  /**
   * Execute a raw query
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>} - Query result
   */
  static async executeRawQuery(query, params = []) {
    const { data, error } = await supabase.rpc('execute_sql', {
      query_text: query,
      query_params: params
    });
    
    if (error) throw error;
    return data;
  }
}

module.exports = DatabaseService;

// Add article operations to the DatabaseService
article: {
  create: async (articleData) => {
    return await supabase
      .from('articles')
      .insert(articleData)
      .select()
      .then(({ data, error }) => {
        if (error) throw error;
        return data[0];
      });
  },
  
  getAll: async ({ page = 1, limit = 10, tag = null }) => {
    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    if (tag) {
      query = query.contains('tags', [tag]);
    }
    
    return await query.then(({ data, error }) => {
      if (error) throw error;
      return data;
    });
  },
  
  getById: async (id) => {
    return await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        return data;
      });
  },
  
  update: async (id, updateData) => {
    return await supabase
      .from('articles')
      .update({ ...updateData, updated_at: new Date() })
      .eq('id', id)
      .select()
      .then(({ data, error }) => {
        if (error) throw error;
        return data[0];
      });
  },
  
  delete: async (id) => {
    return await supabase
      .from('articles')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) throw error;
        return true;
      });
  }
},