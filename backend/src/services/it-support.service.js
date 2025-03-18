const DomainDetectionService = require('./domain-detection.service');
const TavilyService = require('./tavily.service');
const GeminiService = require('./gemini.service');

/**
 * Service for handling the complete IT support query pipeline
 */
class ITSupportService {
  /**
   * Process an IT support query through the complete pipeline
   * @param {string} query - User query
   * @returns {Promise<Object>} - Processing result
   */
  async processQuery(query) {
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
        result.response = DomainDetectionService.getNonITSupportResponse();
        return result;
      }
      
      // Step 3: Get IT support category
      result.category = DomainDetectionService.getITSupportCategory(query);
      
      // Step 4: Get sources from Tavily
      console.log(`Fetching sources for IT query in category: ${result.category || 'general'}`);
      result.sources = await TavilyService.getITSupportSources(query, result.category);
      
      // Log source retrieval
      console.log(`Retrieved ${result.sources.length} sources for query`);
      
      // Step 5: Generate response with Gemini
      console.log('Generating response based on sources...');
      result.response = await GeminiService.generateITSupportResponse(
        query, 
        result.sources,
        result.category
      );
      
      return result;
    } catch (error) {
      console.error('Error processing IT support query:', error);
      return {
        query,
        isITRelated: true,
        error: true,
        errorMessage: error.message,
        timestamp: new Date().toISOString(),
        response: 'I apologize, but I encountered a technical issue while processing your request. Please try again or contact our support team directly for immediate assistance.'
      };
    }
  }
  
  /**
   * Get sources for an IT support query (first step of two-step process)
   * @param {string} query - User query
   * @returns {Promise<Object>} - Sources result
   */
  async getSources(query) {
    try {
      // Check if query is IT-related
      const isITRelated = DomainDetectionService.isITSupportDomain(query);
      
      if (!isITRelated) {
        return {
          isITRelated: false,
          message: DomainDetectionService.getNonITSupportResponse(),
          sources: []
        };
      }
      
      // Get category and sources
      const category = DomainDetectionService.getITSupportCategory(query);
      const sources = await TavilyService.getITSupportSources(query, category);
      
      return {
        isITRelated: true,
        category,
        sources,
        message: sources.length > 0 
          ? `Found ${sources.length} relevant sources for your IT support query.` 
          : "No specific sources found, but I can still help with your query."
      };
    } catch (error) {
      console.error('Error getting sources for IT query:', error);
      return {
        isITRelated: true,
        error: true,
        sources: [],
        message: "Error retrieving sources. I'll try to answer based on my knowledge."
      };
    }
  }
  
  /**
   * Generate response based on sources (second step of two-step process)
   * @param {string} query - User query
   * @param {Array} sources - Sources from first step
   * @param {string} category - IT support category
   * @returns {Promise<Object>} - Response result
   */
  async generateResponse(query, sources, category = null) {
    try {
      const response = await GeminiService.generateITSupportResponse(query, sources, category);
      
      return {
        success: true,
        response
      };
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