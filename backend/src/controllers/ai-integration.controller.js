const AIIntegrationService = require('../services/ai-integration.service');

/**
 * Controller for AI integration endpoints
 */
exports.generateResponseWithSources = async (req, res) => {
  try {
    const { query, options } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }
    
    console.log(`Processing query: ${query}`);
    
    // Get response with sources
    const result = await AIIntegrationService.getResponseWithSources(query, options);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Determine appropriate status code
    let statusCode = 500;
    let errorMessage = 'Error generating AI response';
    
    if (error.message.includes('quota')) {
      statusCode = 429;
      errorMessage = 'API quota exceeded. Please try again later.';
    } else if (error.message.includes('sources')) {
      statusCode = 502;
      errorMessage = 'Error fetching sources. Please try again later.';
    }
    
    res.status(statusCode).json({ 
      message: errorMessage, 
      error: error.message 
    });
  }
};

exports.getSources = async (req, res) => {
  try {
    const { query, options } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }
    
    // Get sources only
    const sources = await AIIntegrationService.getSources(query, options);
    
    res.status(200).json({ query, sources });
  } catch (error) {
    console.error('Error fetching sources:', error);
    res.status(500).json({ 
      message: 'Error fetching sources', 
      error: error.message 
    });
  }
};