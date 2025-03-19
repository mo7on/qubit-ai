const MessageService = require('../services/message.service');
const DatabaseService = require('../services/database.service');
const DomainDetectionService = require('../services/domain-detection.service');
const ConversationManagerService = require('../services/conversation-manager.service');

/**
 * Controller for message endpoints
 */
exports.processMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user.id;
    
    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'No message content provided'
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
    
    // First check if message is within IT Support domain
    const isITSupport = DomainDetectionService.isITSupportDomain(message);
    
    if (!isITSupport) {
      return res.status(403).json({
        status: 'error',
        message: 'Your question does not belong to our field of work. We only handle IT Support related queries.'
      });
    }
    
    // Process message through Gemini AI only if it's in the IT Support domain
    const result = await MessageService.processMessage(message);
    
    if (!result.success) {
      return res.status(500).json({
        status: 'error',
        message: result.message || 'Error processing your message'
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
      message_content: result.response,
      role: 'assistant',
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
        limitReached: atLimit,
        newConversation: newConversation
      }
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error processing your message'
    });
  }
};

/**
 * Create a new message in a conversation
 */
exports.createMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, role } = req.body;
    const userId = req.user.id;
    
    // Check if conversation is closed
    const isClosed = await ConversationManagerService.isConversationClosed(conversationId);
    if (isClosed) {
      return res.status(403).json({
        status: 'error',
        message: 'This conversation has been closed. Please start a new conversation.',
        newConversationRequired: true
      });
    }
    
    // For user messages, check domain before processing
    if (role === 'user' || !role) {
      // Check if message is within IT Support domain
      const isITSupport = DomainDetectionService.isITSupportDomain(content);
      
      if (!isITSupport) {
        // Create user message
        const userMessage = await DatabaseService.message.create({
          conversation_id: conversationId,
          message_content: content,
          role: 'user',
          created_at: new Date()
        });
        
        // Create rejection message
        const rejectionMessage = 'Your question does not belong to our field of work. We only handle IT Support related queries.';
        const assistantMessage = await DatabaseService.message.create({
          conversation_id: conversationId,
          message_content: rejectionMessage,
          role: 'assistant',
          metadata: {
            isITSupport: false
          },
          created_at: new Date()
        });
        
        // Update conversation timestamp
        await DatabaseService.conversation.update(conversationId, {
          updated_at: new Date()
        });
        
        return res.status(201).json({
          status: 'success',
          data: {
            userMessage,
            assistantMessage,
            isITSupport: false
          }
        });
      }
      
      // Create user message
      const userMessage = await DatabaseService.message.create({
        conversation_id: conversationId,
        message_content: content,
        role: 'user',
        created_at: new Date()
      });
      
      // Process message through Gemini AI
      const result = await MessageService.processMessage(content);
      
      // Create AI response message
      const assistantMessage = await DatabaseService.message.create({
        conversation_id: conversationId,
        message_content: result.response,
        role: 'assistant',
        metadata: {
          isITSupport: true
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
      
      return res.status(201).json({
        status: 'success',
        data: {
          userMessage,
          assistantMessage,
          isITSupport: true,
          limitReached: atLimit,
          newConversation: newConversation
        }
      });
    }
    
    // Create new non-user message
    const message = await DatabaseService.message.create({
      conversation_id: conversationId,
      message_content: content,
      role: role,
      created_at: new Date()
    });
    
    // Update conversation timestamp
    await DatabaseService.conversation.update(conversationId, {
      updated_at: new Date()
    });
    
    return res.status(201).json({
      status: 'success',
      data: {
        message
      }
    });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating message'
    });
  }
};