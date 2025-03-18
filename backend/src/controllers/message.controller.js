const MessageService = require('../services/message.service');
const DatabaseService = require('../services/database.service');

/**
 * Controller for message endpoints
 */
exports.processMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    // Process message through Gemini AI
    const result = await MessageService.processMessage(message);
    
    if (!result.success) {
      return res.status(500).json({
        status: 'error',
        message: result.message || 'Error processing your message'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        response: result.response
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
    
    // Create new user message
    const userMessage = await DatabaseService.message.create({
      conversation_id: conversationId,
      content,
      role: role || 'user',
      created_at: new Date()
    });
    
    // If this is a user message, generate an AI response
    if (role === 'user' || !role) {
      // Process message through Gemini AI
      const result = await MessageService.processMessage(content);
      
      // Create AI response message
      const assistantMessage = await DatabaseService.message.create({
        conversation_id: conversationId,
        content: result.response,
        role: 'assistant',
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
          assistantMessage
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