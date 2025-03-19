const AIIntegrationService = require('../services/ai-integration.service');
const DatabaseService = require('../services/database.service');
const ConversationManagerService = require('../services/conversation-manager.service');
const DeviceDetectionService = require('../services/domain-detection.service');

/**
 * Controller for chat endpoints
 */
exports.processChat = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user.id;
    
    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'No message content provided'
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
    
    // Extract device information
    const { deviceBrand } = DeviceDetectionService.analyzeMessage(message);
    
    // Get sources
    const sourcesResult = await AIIntegrationService.getSources(message);
    
    // Generate response
    const responseResult = await AIIntegrationService.generateResponse(
      message,
      sourcesResult.sources || [],
      { deviceBrand }
    );
    
    if (!responseResult.success) {
      return res.status(500).json({
        status: 'error',
        message: responseResult.response || 'Error processing your message'
      });
    }
    
    // Store messages in database
    const userMessage = await DatabaseService.message.create({
      conversation_id: conversationId,
      message_content: message,
      role: 'user',
      created_at: new Date()
    });
    
    const assistantMessage = await DatabaseService.message.create({
      conversation_id: conversationId,
      message_content: responseResult.response,
      role: 'assistant',
      metadata: {
        sources: sourcesResult.sources || [],
        deviceBrand
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
        response: responseResult.response,
        sources: sourcesResult.sources || [],
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