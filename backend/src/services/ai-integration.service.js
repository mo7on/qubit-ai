const { GoogleGenerativeAI } = require('@google/generative-ai');
const DeviceDetectionService = require('./domain-detection.service');

/**
 * Service for AI integration with Gemini
 */
class AIIntegrationService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Get sources for a query using Gemini AI
   * @param {string} query - User query
   * @returns {Promise<Object>} - Sources result
   */
  async getSources(query) {
    try {
      // Generate relevant sources using Gemini AI
      const prompt = `
        For the following query, generate 3-5 relevant sources of information 
        that would help answer this question.
        
        Query: "${query}"
        
        For each source, provide:
        1. A title
        2. A brief description (1-2 sentences)
        3. A URL (if you don't know the exact URL, create a plausible one)
        
        Format your response as a JSON array of objects with title, description, and url properties.
        Example: [{"title": "Troubleshooting Windows 10 Boot Issues", "description": "Official Microsoft guide on resolving startup problems", "url": "https://support.microsoft.com/windows/troubleshoot-boot-problems"}]
      `;
      
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract JSON array from response
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (jsonMatch) {
        const sources = JSON.parse(jsonMatch[0]);
        
        return {
          success: true,
          sources
        };
      }
      
      throw new Error('Failed to parse sources from AI response');
    } catch (error) {
      console.error('Error getting sources:', error);
      return {
        success: false,
        message: 'Error retrieving sources',
        sources: []
      };
    }
  }

  /**
   * Generate response based on query and sources
   * @param {string} query - User query
   * @param {Array} sources - Sources to use for response
   * @param {Object} options - Additional options like deviceBrand
   * @returns {Promise<Object>} - Generated response
   */
  async generateResponse(query, sources = [], options = {}) {
    try {
      // Format sources for prompt
      const sourcesText = sources.length > 0
        ? `Sources:\n${sources.map((s, i) => `${i+1}. ${s.title}: ${s.description}`).join('\n')}`
        : 'No specific sources provided.';
      
      // Add device-specific context if available
      let deviceContext = '';
      if (options.deviceBrand) {
        deviceContext = `The user is specifically asking about a ${options.deviceBrand} device. Tailor your response to address ${options.deviceBrand}-specific solutions when applicable.`;
      }
      
      // Generate response with Gemini AI
      const prompt = `
        You are a helpful AI assistant providing information to a user.
        
        User Query: "${query}"
        
        ${deviceContext}
        
        ${sourcesText}
        
        Based on the query and sources, provide a detailed, helpful response that:
        1. Directly addresses the user's question
        2. Provides step-by-step instructions when applicable
        3. Includes relevant technical details
        4. Is formatted with clear headings and bullet points
        5. References the sources when appropriate
        
        Your response should be comprehensive yet easy to follow.
      `;
      
      const result = await this.model.generateContent(prompt);
      return {
        success: true,
        response: result.response.text()
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        success: false,
        response: 'I apologize, but I encountered a technical issue while generating a response. Please try again later.'
      };
    }
  }
}

module.exports = new AIIntegrationService();