const DomainDetectionService = require('./domain-detection.service');
const GeminiService = require('./gemini.service');
const AIIntegrationService = require('./ai-integration.service');

/**
 * Service for handling the complete IT support query pipeline
 */
class ITSupportService {
  /**
   * Process an IT support query through the complete pipeline
   * @param {string} query - User query
   * @param {Object} options - Additional options like deviceBrand
   * @returns {Promise<Object>} - Processing result
   */
  async processQuery(query, options = {}) {
    try {
      // Step 1: Check if query is IT-related
      const isITRelated = DomainDetectionService.isITSupportDomain(query);
      
      // Create result object
      const result = {
        query,
        isITRelated,
        category: null,
        sources: [],
        response: null,
        timestamp: new Date().toISOString()
      };
      
      // Step 2: Handle non-IT queries immediately
      if (!isITRelated) {
        result.response = 'This system is only for IT Support-related inquiries.';
        return result;
      }
      
      // Step 3: Get IT support category
      result.category = DomainDetectionService.getITSupportCategory(query);
      
      // Step 4: Get sources using Gemini AI
      console.log(`Fetching sources for IT query in category: ${result.category || 'general'}`);
      const sourcesResult = await AIIntegrationService.getSources(query);
      result.sources = sourcesResult.sources || [];
      
      // Log source retrieval
      console.log(`Retrieved ${result.sources.length} sources for query`);
      
      // Step 5: Generate response with Gemini
      console.log('Generating response based on sources...');
      const responseResult = await AIIntegrationService.generateResponse(
        query, 
        result.sources,
        { deviceBrand: options.deviceBrand }
      );
      
      result.response = responseResult.response || 'I apologize, but I encountered an issue generating a response.';
      
      return result;
    } catch (error) {
      console.error('Error processing IT support query:', error);
      return {
        query,
        isITRelated: true,
        category: null,
        sources: [],
        response: 'I apologize, but I encountered a technical issue while processing your request. Please try again later.',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get sources for an IT support query
   * @param {string} query - User query
   * @returns {Promise<Object>} - Sources result
   */
  async getSources(query) {
    try {
      return await AIIntegrationService.getSources(query);
    } catch (error) {
      console.error('Error getting sources for IT query:', error);
      return {
        success: false,
        sources: []
      };
    }
  }

  /**
   * Generate response for an IT support query
   * @param {string} query - User query
   * @param {Array} sources - Sources to use
   * @param {Object} options - Additional options like deviceBrand
   * @returns {Promise<Object>} - Response result
   */
  async generateResponse(query, sources, options = {}) {
    try {
      return await AIIntegrationService.generateResponse(query, sources, options);
    } catch (error) {
      console.error('Error generating response for IT query:', error);
      return {
        success: false,
        response: 'I apologize, but I encountered a technical issue while generating a response. Please try again later.'
      };
    }
  }
}

module.exports = new ITSupportService();