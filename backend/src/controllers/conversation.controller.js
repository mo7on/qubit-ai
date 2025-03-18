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

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Get messages for conversation
    const messages = await DatabaseService.message.getByConversationId(conversationId);
    
    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: {
        messages
      }
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving messages'
    });
  }
};

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
    
    // If this is a user message, generate an AI response
    if (role === 'user' || !role) {
      // Check if the query is related to IT support
      const isITSupportQuery = DomainDetectionService.isITSupportDomain(content);
      
      let aiResponse;
      let sources = [];
      
      if (isITSupportQuery) {
        // Generate AI response with sources for IT support query
        const result = await AIIntegrationService.processMessageWithSources(content);
        aiResponse = result.response;
        sources = result.sources;
      } else {
        // Professional response for non-IT support queries
        aiResponse = DomainDetectionService.getNonITSupportResponse();
      }
      
      // Create AI response message with metadata including sources
      const assistantMessage = await DatabaseService.message.create({
        conversation_id: conversationId,
        content: aiResponse,
        role: 'assistant',
        metadata: {
          isITSupportQuery,
          sources: sources.map(s => ({ title: s.title, url: s.url }))
        },
        created_at: new Date()
      });
      
      // Return both messages and sources
      return res.status(201).json({
        status: 'success',
        data: {
          userMessage,
          assistantMessage,
          sources: isITSupportQuery ? sources : []
        }
      });
    }
    
    // Update conversation's updated_at timestamp
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