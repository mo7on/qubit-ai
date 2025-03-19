const { GoogleGenerativeAI } = require('@google/generative-ai');
const TavilyService = require('./tavily.service');
const DomainDetectionService = require('./domain-detection.service');

/**
 * Service for AI model integration with two-step process
 */
class AIIntegrationService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  /**
   * Step 1: Get sources from Tavily
   * @param {string} query - User query
   * @returns {Promise<Array>} - Array of sources
   */
  async getSources(query) {
    try {
      // Check if query is IT-related first
      const isITRelated = DomainDetectionService.isITSupportDomain(query);
      
      if (!isITRelated) {
        return {
          success: false,
          isITRelated: false,
          sources: [],
          message: DomainDetectionService.getNonITSupportResponse()
        };
      }
      
      // Get sources from Tavily
      const sources = await TavilyService.searchSources(query);
      
      return {
        success: true,
        isITRelated: true,
        sources: sources,
        message: sources.length > 0 
          ? "Found relevant sources for your query." 
          : "No specific sources found, but I can still help with your query."
      };
    } catch (error) {
      console.error('Error getting sources:', error);
      return {
        success: false,
        isITRelated: true,
        sources: [],
        message: "Error retrieving sources. I'll try to answer based on my knowledge."
      };
    }
  }

  /**
   * Step 2: Generate response based on sources
   * @param {string} query - User query
   * @param {Array} sources - Sources from Tavily
   * @returns {Promise<string>} - Generated response
   */
  async generateResponse(query, sources) {
    try {
      // Format sources for the prompt
      const sourcesText = sources.length > 0 
        ? sources.map((s, i) => `Source ${i+1}: ${s.title}\n${s.content.substring(0, 500)}...\nURL: ${s.url}`).join('\n\n')
        : 'No specific sources available.';
      
      // Create prompt with IT support context and sources
      const prompt = `
        You are an expert IT support specialist with extensive technical knowledge.
        
        TASK: Provide a detailed, step-by-step technical response to the following IT support query.
        
        USER QUERY: "${query}"
        
        REFERENCE SOURCES:
        ${sourcesText}
        
        GUIDELINES:
        - Focus ONLY on IT support and technical assistance
        - Base your response on the provided sources when applicable
        - Include specific diagnostic steps
        - Suggest practical solutions with clear instructions
        - Mention potential causes of the issue
        - Use technical terminology appropriately but explain complex concepts
        - Format your response with clear headings and numbered steps
        - At the end of your response, include a "Sources" section that lists the URLs you referenced
        
        RESPONSE FORMAT:
        1. Brief assessment of the issue
        2. Step-by-step troubleshooting process
        3. Potential solutions
        4. Additional recommendations
        5. Sources (list the URLs you referenced)
      `;
      
      const result = await this.model.generateContent(prompt);
      return {
        success: true,
        response: result.response.text()
      };
    } catch (error) {
      console.error('Error generating response with Gemini:', error);
      return {
        success: false,
        response: 'I apologize, but I encountered a technical issue while generating a response. Here are some general troubleshooting steps you can try while I work on fixing this issue.'
      };
    }
  }
}

module.exports = new AIIntegrationService();