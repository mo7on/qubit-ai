const DatabaseService = require('./database.service');
const aiConfig = require('../config/ai.config');

/**
 * Service for managing conversation lifecycle and limits
 */
class ConversationManagerService {
  /**
   * Check if a conversation has reached its response limit
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<boolean>} - True if conversation is at or over limit
   */
  async isConversationAtLimit(conversationId) {
    try {
      // Get all messages for the conversation
      const messages = await DatabaseService.message.getByConversationId(conversationId);
      
      // Count assistant messages (AI responses)
      const assistantMessageCount = messages.filter(msg => msg.role === 'assistant').length;
      
      // Check if count is at or exceeds the limit
      return assistantMessageCount >= aiConfig.conversation.maxResponses;
    } catch (error) {
      console.error('Error checking conversation limit:', error);
      // Default to false to allow messages in case of error
      return false;
    }
  }
  
  /**
   * Check if a conversation is closed
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<boolean>} - True if conversation is closed
   */
  async isConversationClosed(conversationId) {
    try {
      const conversation = await DatabaseService.conversation.getById(conversationId);
      return conversation.status === 'closed';
    } catch (error) {
      console.error('Error checking if conversation is closed:', error);
      // Default to false to allow messages in case of error
      return false;
    }
  }
  
  /**
   * Close a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object>} - Updated conversation
   */
  async closeConversation(conversationId) {
    try {
      return await DatabaseService.conversation.update(conversationId, {
        status: 'closed',
        updated_at: new Date()
      });
    } catch (error) {
      console.error('Error closing conversation:', error);
      throw error;
    }
  }
  
  /**
   * Create a new conversation for a user
   * @param {string} userId - User ID
   * @param {string} title - Conversation title (optional)
   * @returns {Promise<Object>} - New conversation
   */
  async createNewConversation(userId, title = 'New Conversation') {
    try {
      return await DatabaseService.conversation.create({
        user_id: userId,
        title,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });
    } catch (error) {
      console.error('Error creating new conversation:', error);
      throw error;
    }
  }
  
  /**
   * Add conversation to history
   * @param {string} userId - User ID
   * @param {string} conversationId - Conversation ID
   * @param {string} summary - Conversation summary (optional)
   * @returns {Promise<Object>} - History entry
   */
  async addToHistory(userId, conversationId, summary = null) {
    try {
      // If no summary provided, generate one from the first user message
      if (!summary) {
        const messages = await DatabaseService.message.getByConversationId(conversationId);
        const firstUserMessage = messages.find(msg => msg.role === 'user');
        summary = firstUserMessage ? 
          (firstUserMessage.message_content.length > 50 ? 
            `${firstUserMessage.message_content.substring(0, 50)}...` : 
            firstUserMessage.message_content) : 
          'Conversation';
      }
      
      return await DatabaseService.conversationHistory.create({
        user_id: userId,
        conversation_id: conversationId,
        summary,
        created_at: new Date()
      });
    } catch (error) {
      console.error('Error adding conversation to history:', error);
      throw error;
    }
  }
  
  /**
   * Handle conversation limit reached
   * @param {string} userId - User ID
   * @param {string} conversationId - Current conversation ID
   * @returns {Promise<Object>} - New conversation
   */
  async handleLimitReached(userId, conversationId) {
    try {
      // 1. Close the current conversation
      await this.closeConversation(conversationId);
      
      // 2. Add to history
      await this.addToHistory(userId, conversationId);
      
      // 3. Create a new conversation
      return await this.createNewConversation(userId);
    } catch (error) {
      console.error('Error handling conversation limit:', error);
      throw error;
    }
  }
}

module.exports = new ConversationManagerService();