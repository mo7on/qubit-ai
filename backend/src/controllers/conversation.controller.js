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

/**
 * Check if a query is related to IT support
 * @param {string} query - User query
 * @returns {Promise<boolean>} - Whether the query is related to IT support
 */
async function isITSupportDomain(query) {
  try {
    if (!query || typeof query !== 'string') {
      return false;
    }

    // IT support domains and their related keywords
    const itSupportDomains = {
      hardware: [
        'computer', 'laptop', 'desktop', 'server', 'monitor', 'keyboard', 'mouse',
        'printer', 'scanner', 'usb', 'hard drive', 'ssd', 'ram', 'cpu', 'processor',
        'gpu', 'graphics card', 'motherboard', 'power supply', 'battery', 'charger',
        'adapter', 'cable', 'port', 'hdmi', 'vga', 'dvi', 'displayport', 'bluetooth',
        'wireless', 'device', 'driver', 'hardware'
      ],
      software: [
        'software', 'program', 'application', 'app', 'install', 'uninstall', 'update',
        'upgrade', 'windows', 'mac', 'linux', 'android', 'ios', 'office', 'excel',
        'word', 'powerpoint', 'outlook', 'browser', 'chrome', 'firefox', 'edge',
        'safari', 'operating system', 'os', 'version', 'license', 'activation'
      ],
      network: [
        'network', 'wifi', 'internet', 'connection', 'router', 'modem', 'ethernet',
        'ip address', 'dns', 'vpn', 'firewall', 'proxy', 'bandwidth', 'speed test',
        'latency', 'ping', 'packet loss', 'wireless', 'signal', 'hotspot', 'bluetooth'
      ],
      security: [
        'security', 'password', 'login', 'authentication', 'virus', 'malware',
        'ransomware', 'spyware', 'phishing', 'hack', 'breach', 'encryption',
        'firewall', 'antivirus', 'spam', 'backup', 'restore', 'recovery', 'permission',
        'access', 'admin', 'administrator', 'account'
      ],
      troubleshooting: [
        'error', 'bug', 'crash', 'blue screen', 'bsod', 'freeze', 'hang', 'slow',
        'performance', 'troubleshoot', 'fix', 'solve', 'resolve', 'repair', 'issue',
        'problem', 'not working', 'failed', 'boot', 'startup', 'shutdown', 'restart'
      ]
    };

    // Flatten the domains into a single array of keywords
    const allKeywords = Object.values(itSupportDomains).flat();
    
    // Convert query to lowercase for case-insensitive matching
    const lowercaseQuery = query.toLowerCase();
    
    // Check if any IT support keyword is in the query
    const containsITKeyword = allKeywords.some(keyword => 
      lowercaseQuery.includes(keyword.toLowerCase())
    );
    
    if (containsITKeyword) {
      return true;
    }
    
    // Technical question patterns
    const technicalQuestionPatterns = [
      /how (do|can|to|would|should) .* (fix|solve|resolve|troubleshoot|repair|setup|configure|install)/i,
      /why (is|does|won't|can't|doesn't|isn't|didn't|couldn't) .* (work|connect|open|start|run|load|respond|function)/i,
      /what (is|are|causes|means|should|could|would) .* (error|issue|problem|bug|crash|message|code|setting)/i,
      /can('t| not)? .* (install|update|connect|access|login|reset|restore|backup|configure|setup)/i,
      /is there (a way|a method|a solution) to .* (fix|solve|resolve|troubleshoot|repair)/i,
      /trouble with .* (computer|laptop|device|software|hardware|network|connection|internet)/i,
      /need help .* (setting up|configuring|installing|fixing|troubleshooting|resolving)/i
    ];
    
    return technicalQuestionPatterns.some(pattern => pattern.test(lowercaseQuery));
  } catch (error) {
    console.error('Error checking IT support domain:', error);
    // Default to false in case of error to avoid providing incorrect information
    return false;
  }
}

/**
 * Generate an IT support response
 * @param {string} query - User query
 * @returns {Promise<string>} - Generated response
 */
async function generateITSupportResponse(query) {
  try {
    // Create a more professional IT support context
    const contextualizedQuery = `
      As an IT support specialist, please provide a professional, accurate, and helpful response to the following technical question. 
      Include troubleshooting steps, potential solutions, and any relevant technical information that would help resolve the issue.
      
      User query: ${query}
    `;
    
    // Use AI integration service to generate response
    if (AIIntegrationService && AIIntegrationService.processMessage) {
      const result = await AIIntegrationService.processMessage(contextualizedQuery);
      return result.response;
    }
    
    // Comprehensive fallback response if AI service is unavailable
    return `
      Thank you for your IT support inquiry. Based on your question about "${query.substring(0, 40)}...", 
      
      Here are some initial troubleshooting steps:
      
      1. Ensure all relevant software and drivers are up to date
      2. Restart the affected device or application
      3. Check for any error messages and document them
      4. Verify network connectivity if applicable
      5. Check system resources (CPU, memory, disk space)
      
      For more specific assistance, please provide additional details about your system configuration, 
      including operating system version, hardware specifications, and the exact error messages you're encountering.
      
      Our support team is available to help if you need further assistance.
    `;
  } catch (error) {
    console.error('Error generating IT support response:', error);
    return "I apologize, but I encountered a technical issue while processing your request. Please try again or contact our support team directly for immediate assistance.";
  }
}

// Update the createMessage function to handle non-IT support queries more professionally
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
      const isITSupportQuery = await isITSupportDomain(content);
      
      let aiResponse;
      if (isITSupportQuery) {
        // Generate AI response for IT support query
        aiResponse = await generateITSupportResponse(content);
      } else {
        // Professional response for non-IT support queries
        aiResponse = "This query does not appear to be related to IT support. I'm specialized in providing technical support for computer systems, software, networks, and other IT-related issues. Please feel free to ask any technology or IT support questions, and I'll be happy to assist you.";
      }
      
      // Create AI response message
      await DatabaseService.message.create({
        conversation_id: conversationId,
        content: aiResponse,
        role: 'assistant',
        created_at: new Date()
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

// Add other controller methods as needed