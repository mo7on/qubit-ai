const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Service for handling message processing with Gemini AI
 */
class MessageService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Process a user message with Gemini AI
   * @param {string} message - User message
   * @returns {Promise<Object>} - Processing result
   */
  async processMessage(message) {
    try {
      // Generate response with Gemini AI
      const response = await this.generateITSupportResponse(message);
      
      return {
        success: true,
        response: response
      };
    } catch (error) {
      console.error('Error processing message with Gemini AI:', error);
      return {
        success: false,
        error: true,
        message: 'Error processing your message',
        response: 'I apologize, but I encountered a technical issue while processing your request. Please try again later.'
      };
    }
  }

  /**
   * Generate IT support response using Gemini AI
   * @param {string} query - User query
   * @returns {Promise<string>} - Generated response
   */
  async generateITSupportResponse(query) {
    try {
      // Create prompt with IT support context
      const prompt = `
        You are an expert IT support specialist with extensive technical knowledge.
        
        TASK: Provide a detailed, step-by-step technical response to the following IT support query.
        
        USER QUERY: "${query}"
        
        GUIDELINES:
        - Focus ONLY on IT support and technical assistance
        - Include specific diagnostic steps
        - Suggest practical solutions with clear instructions
        - Mention potential causes of the issue
        - Use technical terminology appropriately but explain complex concepts
        - Format your response with clear headings and numbered steps
        - At the end of your response, include a "Sources" section that lists any references you used
        
        RESPONSE FORMAT:
        ## Issue Assessment
        [Brief assessment of the technical issue]
        
        ## Troubleshooting Steps
        1. [First step]
        2. [Second step]
        ...
        
        ## Solution
        [Recommended solution(s)]
        
        ## Additional Recommendations
        [Optional additional advice]
        
        ## Sources
        [List any sources you referenced]
      `;
      
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating IT support response with Gemini:', error);
      return 'I apologize, but I encountered a technical issue while generating a response. Please try again later.';
    }
  }
}

module.exports = new MessageService();