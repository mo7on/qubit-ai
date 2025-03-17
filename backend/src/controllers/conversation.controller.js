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
 * Extract device type from user query
 * @param {string} query - User query
 * @returns {string|null} - Detected device type or null if not found
 */
function extractDeviceType(query) {
  if (!query || typeof query !== 'string') {
    return null;
  }
  
  const lowercaseQuery = query.toLowerCase();
  
  // Common device types to detect
  const deviceTypes = {
    'laptop': ['laptop', 'notebook', 'macbook', 'thinkpad', 'dell laptop', 'hp laptop', 'lenovo laptop'],
    'desktop': ['desktop', 'pc', 'computer', 'workstation', 'tower'],
    'smartphone': ['phone', 'smartphone', 'iphone', 'android', 'mobile', 'cell phone'],
    'tablet': ['tablet', 'ipad', 'galaxy tab', 'surface'],
    'printer': ['printer', 'scanner', 'all-in-one', 'multifunction printer'],
    'router': ['router', 'modem', 'wifi router', 'access point', 'network device'],
    'monitor': ['monitor', 'display', 'screen', 'lcd', 'led display'],
    'peripheral': ['keyboard', 'mouse', 'headset', 'webcam', 'microphone', 'speakers']
  };
  
  // Check for device type mentions
  for (const [deviceType, keywords] of Object.entries(deviceTypes)) {
    if (keywords.some(keyword => lowercaseQuery.includes(keyword))) {
      return deviceType;
    }
  }
  
  return null;
}

/**
 * Generate an IT support response with device-specific troubleshooting
 * @param {string} query - User query
 * @returns {Promise<string>} - Generated response
 */
async function generateITSupportResponse(query) {
  try {
    // Extract device type from query
    const deviceType = extractDeviceType(query);
    
    // Create a device-specific context if a device was detected
    let contextualizedQuery = '';
    
    if (deviceType) {
      contextualizedQuery = `
        You are an expert IT support specialist with extensive experience troubleshooting ${deviceType} issues.
        
        TASK: Provide a detailed, step-by-step technical response to the following query about a ${deviceType}.
        
        GUIDELINES:
        - Focus ONLY on IT support and technical assistance
        - Include specific diagnostic steps for this ${deviceType}
        - Suggest practical solutions with clear instructions
        - Mention potential causes of the issue
        - If relevant, include preventative maintenance tips
        - Use technical terminology appropriately but explain complex concepts
        - Format your response with clear headings and numbered steps
        - If you need more information to provide a complete solution, specify exactly what details would help
        
        USER QUERY: "${query}"
        
        RESPONSE FORMAT:
        1. Brief assessment of the issue
        2. Step-by-step troubleshooting process
        3. Potential solutions
        4. Additional recommendations
      `;
    } else {
      contextualizedQuery = `
        You are an expert IT support specialist with extensive technical knowledge across hardware, software, and networking.
        
        TASK: Provide a detailed, step-by-step technical response to the following IT support query.
        
        GUIDELINES:
        - Focus ONLY on IT support and technical assistance
        - If the query is not related to IT support, politely explain that you can only help with technical issues
        - Include specific diagnostic steps
        - Suggest practical solutions with clear instructions
        - Mention potential causes of the issue
        - Use technical terminology appropriately but explain complex concepts
        - Format your response with clear headings and numbered steps
        - If you need more information to provide a complete solution, specify exactly what details would help
        
        USER QUERY: "${query}"
        
        RESPONSE FORMAT:
        1. Brief assessment of the issue
        2. Step-by-step troubleshooting process
        3. Potential solutions
        4. Additional recommendations
      `;
    }
    
    // Use AI integration service to generate response
    if (AIIntegrationService && AIIntegrationService.processMessage) {
      const result = await AIIntegrationService.processMessage(contextualizedQuery);
      return result.response;
    }
    
    // Device-specific fallback responses if AI service is unavailable
    const deviceSpecificTips = {
      'laptop': `
        For laptop issues, check:
        1. Battery health and power adapter connection
        2. Cooling vents for dust buildup
        3. Power management settings
        4. External display connection if screen issues
        5. Update drivers, especially graphics and chipset
      `,
      'desktop': `
        For desktop computer issues, check:
        1. All cable connections (power, monitor, peripherals)
        2. Internal components for dust or loose connections
        3. Power supply functionality
        4. RAM seating and potential issues
        5. Update motherboard BIOS and drivers
      `,
      'smartphone': `
        For smartphone issues, try:
        1. Restart the device
        2. Check for system updates
        3. Clear app cache and data
        4. Check storage space availability
        5. Test in safe mode to identify problematic apps
      `,
      'tablet': `
        For tablet issues, try:
        1. Force restart the device
        2. Check charging port for debris
        3. Update the operating system
        4. Reset to factory settings as a last resort
        5. Check for screen or digitizer damage
      `,
      'printer': `
        For printer issues, check:
        1. Paper jams and ink/toner levels
        2. Network connection or USB cable
        3. Print spooler service status
        4. Driver updates and compatibility
        5. Printer firmware updates
      `,
      'router': `
        For router/network issues, try:
        1. Power cycle the router and modem
        2. Check for firmware updates
        3. Verify wireless channel settings
        4. Reset to factory defaults if necessary
        5. Check for interference sources
      `
    };
    
    // Generate fallback response based on device type
    if (deviceType && deviceSpecificTips[deviceType]) {
      return `
        Thank you for your IT support inquiry about your ${deviceType}. Based on your question about "${query.substring(0, 40)}...", 
        
        ${deviceSpecificTips[deviceType]}
        
        For more specific assistance, please provide additional details about your ${deviceType} model, 
        operating system version, and the exact error messages you're encountering.
        
        Our support team is available to help if you need further assistance.
      `;
    }
    
    // Generic fallback response
    return `
      Thank you for your IT support inquiry. Based on your question about "${query.substring(0, 40)}...", 
      
      Here are some initial troubleshooting steps:
      
      1. Ensure all relevant software and drivers are up to date
      2. Restart the affected device or application
      3. Check for any error messages and document them
      4. Verify network connectivity if applicable
      5. Check system resources (CPU, memory, disk space)
      
      For more specific assistance, please provide additional details about your system configuration, 
      including device type, operating system version, and the exact error messages you're encountering.
      
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
        // Clear and professional response for non-IT support queries
        aiResponse = "I'm sorry, but your question appears to be outside the scope of IT support. I'm specifically designed to help with technical issues related to computers, software, networks, and other IT-related topics. I cannot provide assistance with non-IT related questions. Please feel free to ask any technology or IT support questions, and I'll be happy to help.";
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