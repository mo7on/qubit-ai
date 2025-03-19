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
    
    // First check if message is within IT Support domain and extract device info
    const domainResult = DomainDetectionService.analyzeMessage(message);
    
    if (!domainResult.isITSupport) {
      return res.status(403).json({
        status: 'error',
        message: 'Your question does not belong to our field of work. We only handle IT Support related queries.'
      });
    }
    
    // Process message through Gemini AI only if it's in the IT Support domain
    // Pass device brand information if available
    const result = await MessageService.processMessage(message, {
      deviceBrand: domainResult.deviceBrand
    });
    
    if (!result.success) {
      return res.status(500).json({
        status: 'error',
        message: result.message || 'Error processing your message'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        response: result.response,
        deviceBrand: domainResult.deviceBrand
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
      // Check if message is within IT Support domain and extract device info
      const domainResult = DomainDetectionService.analyzeMessage(content);
      
      if (!domainResult.isITSupport) {
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
        metadata: {
          deviceBrand: domainResult.deviceBrand
        },
        created_at: new Date()
      });
      
      // Process message through Gemini AI with device brand info
      const result = await MessageService.processMessage(content, {
        deviceBrand: domainResult.deviceBrand
      });
      
      // Create AI response message
      const assistantMessage = await DatabaseService.message.create({
        conversation_id: conversationId,
        message_content: result.response,
        role: 'assistant',
        metadata: {
          isITSupport: true,
          deviceBrand: domainResult.deviceBrand
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
          isITSupport: true,
          deviceBrand: domainResult.deviceBrand
        }
      });
    } else {
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
    }
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating message'
    });
  }
};