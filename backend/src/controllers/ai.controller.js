const AIService = require('../services/ai.service');
const HistoryService = require('../services/history.service');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

/**
 * Generate AI response with sources
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateResponseWithSources = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      status: 'error',
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  
  const { query, options } = req.body;
  const userId = req.userId;
  
  // Request tracking
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const clientIp = req.headers['x-forwarded-for'] || req.ip;
  const userAgent = req.headers['user-agent'];
  
  logger.info(`[${requestId}] New AI query request from ${clientIp}: ${query}`);
  
  try {
    // Get response with sources
    const result = await AIService.getResponseWithSources(query, options);
    
    // Log activity if user is authenticated
    if (userId) {
      await HistoryService.logActivity({
        userId,
        action: 'GENERATE_AI_RESPONSE',
        entityType: 'AI_QUERY',
        entityId: null,
        details: { 
          query,
          sourceCount: result.sources.length,
          requestId
        },
        ipAddress: clientIp,
        userAgent
      });
    }
    
    // Add request metadata
    result.requestId = requestId;
    
    logger.info(`[${requestId}] AI response generated successfully with ${result.sources.length} sources`);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error(`[${requestId}] Error generating AI response: ${error.message}`, { error, query });
    
    // Determine appropriate status code based on error
    let statusCode = 500;
    let errorMessage = 'An error occurred while generating the AI response';
    
    if (error.message.includes('quota')) {
      statusCode = 429;
      errorMessage = 'API quota exceeded. Please try again later.';
    } else if (error.message.includes('validation')) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message.includes('safety')) {
      statusCode = 403;
      errorMessage = 'The request was blocked due to safety concerns with the query.';
    }
    
    res.status(statusCode).json({
      status: 'error',
      message: errorMessage,
      requestId
    });
  }
};

/**
 * Get sources only without generating a response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSources = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      status: 'error',
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  
  const { query, options } = req.body;
  const userId = req.userId;
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  logger.info(`[${requestId}] New sources request: ${query}`);
  
  try {
    const sources = await AIService.getSources(query, options);
    
    if (userId) {
      await HistoryService.logActivity({
        userId,
        action: 'GET_SOURCES',
        entityType: 'AI_QUERY',
        details: { query, sourceCount: sources.length },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        query,
        sources,
        requestId,
        metadata: {
          sourceCount: sources.length,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    logger.error(`[${requestId}] Error fetching sources: ${error.message}`, { error, query });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch sources',
      requestId
    });
  }
};

/**
 * Generate a response from Gemini without sources
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateResponse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      status: 'error',
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  
  const { prompt, options } = req.body;
  const userId = req.userId;
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  logger.info(`[${requestId}] New direct response request`);
  
  try {
    // Use the Gemini model directly
    const genAI = new (require('@google/generative-ai').GoogleGenerativeAI)(
      process.env.GEMINI_API_KEY
    );
    
    const model = genAI.getGenerativeModel({ 
      model: options?.model || "gemini-pro",
      generationConfig: options?.generationConfig || {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 2048
      }
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    if (userId) {
      await HistoryService.logActivity({
        userId,
        action: 'GENERATE_RESPONSE',
        entityType: 'AI_PROMPT',
        details: { promptLength: prompt.length },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        response: responseText,
        requestId,
        metadata: {
          timestamp: new Date().toISOString(),
          model: options?.model || "gemini-pro"
        }
      }
    });
  } catch (error) {
    logger.error(`[${requestId}] Error generating direct response: ${error.message}`, { error });
    
    let statusCode = 500;
    let errorMessage = 'An error occurred while generating the response';
    
    if (error.message.includes('quota')) {
      statusCode = 429;
      errorMessage = 'API quota exceeded. Please try again later.';
    } else if (error.message.includes('safety')) {
      statusCode = 403;
      errorMessage = 'The request was blocked due to safety concerns.';
    }
    
    res.status(statusCode).json({
      status: 'error',
      message: errorMessage,
      requestId
    });
  }
};

/**
 * Analyze an image with Gemini Vision
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.analyzeImage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      status: 'error',
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  
  const { imageData, prompt, options } = req.body;
  const userId = req.userId;
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  if (!imageData) {
    return res.status(400).json({
      status: 'error',
      message: 'Image data is required',
      requestId
    });
  }
  
  logger.info(`[${requestId}] New image analysis request`);
  
  try {
    // Use the Gemini Vision model
    const genAI = new (require('@google/generative-ai').GoogleGenerativeAI)(
      process.env.GEMINI_API_KEY
    );
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: options?.generationConfig || {
        temperature: 0.4,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    });
    
    const promptText = prompt || "Analyze this image and provide detailed insights";
    
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { text: promptText },
          {
            inlineData: {
              data: imageData,
              mimeType: "image/jpeg"
            }
          }
        ]
      }]
    });
    
    const response = await result.response;
    const analysisText = response.text();
    
    if (userId) {
      await HistoryService.logActivity({
        userId,
        action: 'ANALYZE_IMAGE',
        entityType: 'IMAGE',
        details: { promptText },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        analysis: analysisText,
        prompt: promptText,
        requestId,
        metadata: {
          timestamp: new Date().toISOString(),
          model: "gemini-pro-vision"
        }
      }
    });
  } catch (error) {
    logger.error(`[${requestId}] Error analyzing image: ${error.message}`, { error });
    
    let statusCode = 500;
    let errorMessage = 'An error occurred while analyzing the image';
    
    if (error.message.includes('quota')) {
      statusCode = 429;
      errorMessage = 'API quota exceeded. Please try again later.';
    } else if (error.message.includes('safety')) {
      statusCode = 403;
      errorMessage = 'The request was blocked due to safety concerns with the image or prompt.';
    } else if (error.message.includes('format')) {
      statusCode = 400;
      errorMessage = 'Invalid image format. Please provide a valid image.';
    }
    
    res.status(statusCode).json({
      status: 'error',
      message: errorMessage,
      requestId
    });
  }
};

/**
 * Get user's AI query history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getQueryHistory = async (req, res) => {
  const userId = req.userId;
  
  if (!userId) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }
  
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const history = await HistoryService.getUserHistory(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      action: 'GENERATE_AI_RESPONSE',
      entityType: 'AI_QUERY'
    });
    
    res.status(200).json({
      status: 'success',
      data: history
    });
  } catch (error) {
    logger.error(`Error fetching user query history: ${error.message}`, { error, userId });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch query history'
    });
  }
};

module.exports = exports;