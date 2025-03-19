const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
const cache = require('../utils/cache');
const { performance } = require('perf_hooks');
const BaseService = require('./base.service');
const DomainDetectionService = require('./domain-detection.service');
const HistoryService = require('./history.service');
const { ErrorHandler } = require('../utils/error-handler');

// Initialize Gemini AI with enhanced configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-pro",
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    }
  ],
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  }
});

// Cache TTL in seconds
const CACHE_TTL = 3600; // 1 hour

class AIService extends BaseService {
  /**
   * Generate a response using Gemini AI
   * @param {string} query - The user's query
   * @param {Object} options - Additional options for generation
   * @returns {Promise<string>} - Generated response
   */
  static async generateResponse(query, options = {}) {
    const startTime = performance.now();
    const cacheKey = `gemini:${query}:${JSON.stringify(options)}`;
    
    try {
      // Check cache first
      const cachedResponse = await cache.get(cacheKey);
      if (cachedResponse) {
        logger.info(`Cache hit for query: ${query}`);
        return JSON.parse(cachedResponse);
      }
      
      // Create prompt with query
      const prompt = `
        You are a helpful AI assistant that provides accurate, factual information.
        
        Answer the following query:
        
        Query: ${query}
        
        Instructions:
        1. Provide a comprehensive answer based on your knowledge.
        2. If you don't have enough information to answer the query, please state that clearly.
        3. Focus on factual information and avoid speculation.
        4. Format your response in markdown for better readability.
        5. If appropriate, structure your response with headings, bullet points, or numbered lists.
        
        Your response:
      `;
      
      logger.info(`Generating Gemini response for query: ${query}`);
      
      // Apply custom generation options if provided
      const generationOptions = options.generationConfig || {};
      
      // Generate response with Gemini
      const result = await geminiModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          ...geminiModel.generationConfig,
          ...generationOptions
        }
      });
      
      const response = await result.response;
      const responseText = response.text();
      
      // Cache the response
      await cache.set(cacheKey, JSON.stringify(responseText), CACHE_TTL);
      
      const duration = ((performance.now() - startTime) / 1000).toFixed(2);
      logger.info(`Gemini response generated in ${duration}s`);
      
      return responseText;
    } catch (error) {
      const duration = ((performance.now() - startTime) / 1000).toFixed(2);
      logger.error(`Error generating response with Gemini (${duration}s): ${error.message}`, { 
        error, 
        query 
      });
      
      // Handle specific Gemini API errors
      if (error.message.includes('quota')) {
        throw ErrorHandler.serviceUnavailable('API quota exceeded. Please try again later.', 'QUOTA_EXCEEDED');
      }
      
      if (error.message.includes('safety')) {
        throw ErrorHandler.badRequest('The request was blocked due to safety concerns with the query.', 'SAFETY_BLOCKED');
      }
      
      throw ErrorHandler.serverError(`Failed to generate AI response: ${error.message}`, 'AI_GENERATION_FAILED');
    }
  }

  /**
   * Process a query with enhanced context handling
   * @param {string} query - The user's query
   * @param {Object} options - Additional options for processing
   * @returns {Promise<Object>} - Result with response and metadata
   */
  static async processQuery(query, options = {}) {
    return this.logExecution('processQuery', async () => {
      const requestId = this.generateRequestId();
      
      // Check if query is IT-related
      const isITRelated = DomainDetectionService.isITSupportDomain ? 
        DomainDetectionService.isITSupportDomain(query) : false;
      
      let category = null;
      if (isITRelated && DomainDetectionService.getITSupportCategory) {
        category = DomainDetectionService.getITSupportCategory(query);
      }
      
      // Generate appropriate response
      const response = isITRelated ? 
        await this.generateITSupportResponse(query, category, options.gemini || {}) :
        await this.generateResponse(query, options.gemini || {});
      
      // Log the interaction to history if userId is provided
      if (options.userId) {
        await HistoryService.logActivity({
          userId: options.userId,
          action: 'ai_query',
          entityType: isITRelated ? 'it_support' : 'general_query',
          entityId: requestId,
          details: {
            query,
            isITRelated,
            category
          },
          ipAddress: options.ipAddress,
          userAgent: options.userAgent
        }).catch(err => {
          logger.warn(`Failed to log history for query ${requestId}: ${err.message}`);
        });
      }
      
      // Return result
      return {
        query,
        response,
        metadata: {
          timestamp: new Date().toISOString(),
          model: "gemini-2.0-flash",
          requestId,
          isITRelated,
          category
        }
      };
    }, query, options);
  }
}

module.exports = AIService;