const ITSupportService = require('../services/it-support.service');
const DatabaseService = require('../services/database.service');
const ConversationManagerService = require('../services/conversation-manager.service');

/**
 * Controller for chat endpoints
 */
exports.processChat = async (req, res) => {
  try {
    const { query, conversationId, deviceBrand } = req.body;
    const userId = req.user.id;
    
    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'No query provided'
      });
    }
    
    if (!conversationId) {
      return res.status(400).json({
        status: 'error',
        message: 'No conversation ID provided'
      });
    }
    
    // Check if conversation is closed
    const isClosed = await ConversationManagerService.isConversationClosed(conversationId);
    if (isClosed) {
      return res.status(403).json({
        status: 'error',
        message: 'This conversation has been closed. Please start a new conversation.',
        newConversationRequired: true
      });
    }
    
    // Process the query
    const result = await ITSupportService.processQuery(query, { deviceBrand });
    
    // Store messages in database
    const userMessage = await DatabaseService.message.create({
      conversation_id: conversationId,
      message_content: query,
      role: 'user',
      created_at: new Date()
    });
    
    const assistantMessage = await DatabaseService.message.create({
      conversation_id: conversationId,
      message_content: result.response,
      role: 'assistant',
      metadata: {
        isITRelated: result.isITRelated,
        category: result.category,
        sources: result.sources
      },
      created_at: new Date()
    });
    
    // Update conversation timestamp
    await DatabaseService.conversation.update(conversationId, {
      updated_at: new Date()
    });
    
    // Check if conversation has reached the limit
    const atLimit = await ConversationManagerService.isConversationAtLimit(conversationId);
    
    let newConversation = null;
    if (atLimit) {
      // Handle limit reached - close current conversation and create new one
      newConversation = await ConversationManagerService.handleLimitReached(userId, conversationId);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        userMessage,
        assistantMessage,
        response: result.response,
        isITRelated: result.isITRelated,
        sources: result.sources,
        limitReached: atLimit,
        newConversation: newConversation
      }
    });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error processing your message'
    });
  }
};

/**
 * Create a new conversation
 */
exports.createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;
    
    // Create new conversation
    const conversation = await ConversationManagerService.createNewConversation(userId, title);
    
    // Add to history immediately
    await ConversationManagerService.addToHistory(userId, conversation.id);
    
    res.status(201).json({
      status: 'success',
      data: {
        conversation
      }
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating conversation'
    });
  }
};