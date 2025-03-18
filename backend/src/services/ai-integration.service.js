const { GoogleGenerativeAI } = require('@google/generative-ai');
const TavilyService = require('./tavily.service');

/**
 * Service for AI model integration
 */
class AIIntegrationService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Process a message with research sources
   * @param {string} message - User message
   * @returns {Promise<Object>} - AI response with sources
   */
  async processMessageWithSources(message) {
    try {
      // Step 1: Get sources from Tavily
      console.log('Fetching sources from Tavily for query:', message);
      const sources = await TavilyService.searchSources(message);
      
      // Step 2: Generate response with Gemini using the sources
      const response = await this.generateResponseWithSources(message, sources);
      
      return {
        success: true,
        response: response,
        sources: sources
      };
    } catch (error) {
      console.error('Error processing message with sources:', error);
      return {
        success: false,
        response: 'I apologize, but I encountered a technical issue while processing your request. Please try again or contact our support team directly for immediate assistance.',
        sources: []
      };
    }
  }

  /**
   * Generate a response using sources
   * @param {string} query - User query
   * @param {Array} sources - Sources from Tavily
   * @returns {Promise<string>} - Generated response
   */
  async generateResponseWithSources(query, sources) {
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
      return result.response.text();
    } catch (error) {
      console.error('Error generating response with Gemini:', error);
      return 'I apologize, but I encountered a technical issue while generating a response. Here are some general troubleshooting steps you can try while I work on fixing this issue.';
    }
  }
}

module.exports = new AIIntegrationService();