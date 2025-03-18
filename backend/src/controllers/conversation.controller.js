const DatabaseService = require('../services/database.service');
const AIIntegrationService = require('../services/ai-integration.service');

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
    
    // If this is a user message, process it through the AI pipeline
    if (role === 'user' || !role) {
      const aiResult = await AIIntegrationService.processMessage(content, conversationId);
      
      // Return both the user message and AI response
      return res.status(201).json({
        status: 'success',
        data: {
          userMessage: {
            conversation_id: conversationId,
            content,
            role: 'user'
          },
          aiResponse: {
            conversation_id: conversationId,
            content: aiResult.response,
            role: 'assistant',
            isITRelated: aiResult.isITRelated,
            sources: aiResult.sources || []
          }
        }
      });
    }
    
    // For non-user messages (e.g., system messages)
    const message = await DatabaseService.message.create({
      conversation_id: conversationId,
      content,
      role,
      created_at: new Date()
    });
    
    res.status(201).json({
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

// Add other controller methods as needed