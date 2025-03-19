const MessageService = require('../services/message.service');
const DatabaseService = require('../services/database.service');
const DomainDetectionService = require('../services/domain-detection.service');

/**
 * Controller for message endpoints
 */
exports.processMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'No message content provided'
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
    
    // For user messages, check domain before processing
    if (role === 'user' || !role) {
      // Check if message is within IT Support domain
      const isITSupport = DomainDetectionService.isITSupportDomain(content);
      
      if (!isITSupport) {
        // Create user message with updated fields
        const userMessage = await DatabaseService.message.create({
          conversation_id: conversationId,
          message_content: content, // Updated field name
          role: 'user',
          created_at: new Date()
        });
        
        // Create rejection message with updated fields
        const rejectionMessage = 'Your question does not belong to our field of work. We only handle IT Support related queries.';
        const assistantMessage = await DatabaseService.message.create({
          conversation_id: conversationId,
          message_content: rejectionMessage, // Updated field name
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
    }
    
    // Create new user message with updated fields
    const userMessage = await DatabaseService.message.create({
      conversation_id: conversationId,
      message_content: content, // Updated field name
      role: role || 'user',
      created_at: new Date()
    });
    
    // If this is a user message, generate an AI response
    if (role === 'user' || !role) {
      // Process message through Gemini AI
      const result = await MessageService.processMessage(content);
      
      // Create AI response message with updated fields
      const assistantMessage = await DatabaseService.message.create({
        conversation_id: conversationId,
        message_content: result.response, // Updated field name
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
      
      return res.status(201).json({
        status: 'success',
        data: {
          userMessage,
          assistantMessage,
          isITSupport: true
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