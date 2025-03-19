const DomainDetectionService = require('../services/domain-detection.service');

/**
 * Middleware to check if a message belongs to the IT Support domain
 * and extract device brand information
 */
const checkITSupportDomain = (req, res, next) => {
  try {
    const message = req.body.message || req.body.content;
    
    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'No message content provided'
      });
    }
    
    // Check if message is within IT Support domain
    const domainResult = DomainDetectionService.analyzeMessage(message);
    
    if (!domainResult.isITSupport) {
      return res.status(403).json({
        status: 'error',
        message: 'Your question does not belong to our field of work. We only handle IT Support related queries.'
      });
    }
    
    // If message is in domain, add domain info and continue
    req.domainInfo = domainResult;
    next();
  } catch (error) {
    console.error('Error in domain check middleware:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error processing your request'
    });
  }
};

module.exports = {
  checkITSupportDomain
};