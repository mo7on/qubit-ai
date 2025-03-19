const DatabaseService = require('../services/database.service');
const AIIntegrationService = require('../services/ai-integration.service');
const DomainDetectionService = require('../services/domain-detection.service');

/**
 * Conversation controller
 */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get conversations for user
    const conversations = await DatabaseService.conversation.getByUserId(userId);
    
    res.status(200).json({
      status: 'success',
      results: conversations.length,
      data: {
        conversations
      }
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving conversations'
    });
  }
};

exports.createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;
    
    // Create new conversation
    const conversation = await DatabaseService.conversation.create({
      user_id: userId,
      title: title || 'New Conversation',
      created_at: new Date(),
      updated_at: new Date()
    });
    
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

exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await DatabaseService.message.getByConversationId(conversationId);
    
    // Map messages to client format if needed
    const formattedMessages = messages.map(message => ({
      id: message.id,
      content: message.message_content, // Updated field name
      role: message.role,
      timestamp: message.created_at
    }));
    
    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: {
        messages: formattedMessages
      }
    });
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving conversation messages'
    });
  }
};

// Step 1: Get sources for a query
exports.getSources = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Query is required'
      });
    }
    
    const result = await AIIntegrationService.getSources(query);
    
    res.status(200).json({
      status: result.success ? 'success' : 'error',
      isITRelated: result.isITRelated,
      message: result.message,
      data: {
        sources: result.sources
      }
    });
  } catch (error) {
    console.error('Error getting sources:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving sources'
    });
  }
};

// Step 2: Generate response based on sources
exports.generateResponse = async (req, res) => {
  try {
    const { query, sources, conversationId } = req.body;
    
    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Query is required'
      });
    }
    
    // Generate response
    const result = await AIIntegrationService.generateResponse(query, sources || []);
    
    // If conversation ID is provided, store messages in database
    if (conversationId) {
      // Store user message
      await DatabaseService.message.create({
        conversation_id: conversationId,
        content: query,
        role: 'user',
        created_at: new Date()
      });
      
      // Store AI response with sources metadata
      await DatabaseService.message.create({
        conversation_id: conversationId,
        content: result.response,
        role: 'assistant',
        metadata: {
          sources: sources ? sources.map(s => ({ title: s.title, url: s.url })) : []
        },
        created_at: new Date()
      });
      
      // Update conversation timestamp
      await DatabaseService.conversation.update(conversationId, {
        updated_at: new Date()
      });
    }
    
    res.status(200).json({
      status: result.success ? 'success' : 'error',
      data: {
        response: result.response
      }
    });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error generating response'
    });
  }
};

// Combined method for backward compatibility
exports.createMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, role } = req.body;
    
    // Create new user message
    const userMessage = await DatabaseService.message.create({
      conversation_id: conversationId,
      content,
      role: role || 'user',
      created_at: new Date()
    });
    
    // If this is a user message, process it in two steps
    if (role === 'user' || !role) {
      // Step 1: Get sources
      const sourcesResult = await AIIntegrationService.getSources(content);
      
      let aiResponse;
      let sources = [];
      
      if (!sourcesResult.isITRelated) {
        // Not IT related, use rejection message
        aiResponse = sourcesResult.message;
      } else {
        // Step 2: Generate response based on sources
        sources = sourcesResult.sources;
        const responseResult = await AIIntegrationService.generateResponse(content, sources);
        aiResponse = responseResult.response;
      }
      
      // Create AI response message
      const assistantMessage = await DatabaseService.message.create({
        conversation_id: conversationId,
        content: aiResponse,
        role: 'assistant',
        metadata: {
          isITRelated: sourcesResult.isITRelated,
          sources: sources.map(s => ({ title: s.title, url: s.url }))
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
          sources,
          isITRelated: sourcesResult.isITRelated
        }
      });
    }
    
    // Update conversation timestamp
    await DatabaseService.conversation.update(conversationId, {
      updated_at: new Date()
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        message: userMessage
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

// Add a new endpoint to get sources for a specific message
exports.getMessageSources = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Get message from database
    const message = await DatabaseService.message.getById(messageId);
    
    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }
    
    // Extract sources from message metadata
    const sources = message.metadata && message.metadata.sources ? message.metadata.sources : [];
    
    res.status(200).json({
      status: 'success',
      data: {
        sources
      }
    });
  } catch (error) {
    console.error('Error getting message sources:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving message sources'
    });
  }
};

// Add other controller methods as needed