const AIResearchService = require('../services/ai-research.service');

/**
 * Process a message and return a response with sources
 */
exports.processMessage = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { message, options } = req.body;
    
    // Input validation
    if (!message) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Message is required' 
      });
    }
    
    // Process the message
    const result = await AIResearchService.processMessage(message, options);
    
    // Add processing time to metadata
    result.metadata.processingTime = Date.now() - startTime;
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error processing message:', error);
    
    // Determine appropriate status code
    let statusCode = 500;
    let errorMessage = 'Error processing message';
    
    if (error.message.includes('quota')) {
      statusCode = 429;
      errorMessage = 'API quota exceeded. Please try again later.';
    } else if (error.message.includes('Invalid message')) {
      statusCode = 400;
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({ 
      status: 'error',
      message: errorMessage,
      processingTime: Date.now() - startTime
    });
  }
};

/**
 * Get sources only for a message
 */
exports.getSources = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { message, options } = req.body;
    
    // Input validation
    if (!message) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Message is required' 
      });
    }
    
    // Get sources
    const sources = await AIResearchService.getSources(message, options);
    
    res.status(200).json({
      status: 'success',
      data: {
        query: message,
        sources,
        metadata: {
          timestamp: new Date().toISOString(),
          sourceCount: sources.length,
          processingTime: Date.now() - startTime
        }
      }
    });
  } catch (error) {
    console.error('Error getting sources:', error);
    
    res.status(500).json({ 
      status: 'error',
      message: 'Error getting sources',
      processingTime: Date.now() - startTime
    });
  }
};