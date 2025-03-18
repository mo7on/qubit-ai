const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Service for generating IT support responses using Gemini AI
 */
class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }
  
  /**
   * Generate an IT support response based on sources
   * @param {string} query - User's IT support query
   * @param {Array} sources - Array of sources from Tavily
   * @param {string} category - IT support category
   * @returns {Promise<string>} - Generated response
   */
  async generateITSupportResponse(query, sources, category = null) {
    try {
      // Format sources for the prompt
      const sourcesText = this._formatSourcesForPrompt(sources);
      
      // Create category-specific instructions
      const categoryInstructions = this._getCategoryInstructions(category);
      
      // Build the prompt
      const prompt = `
        You are an expert IT support specialist with extensive technical knowledge.
        
        TASK: Provide a detailed, step-by-step technical response to the following IT support query.
        
        USER QUERY: "${query}"
        
        REFERENCE SOURCES:
        ${sourcesText}
        
        ${categoryInstructions}
        
        GUIDELINES:
        - Focus ONLY on IT support and technical assistance
        - Base your response primarily on the provided sources
        - Include specific diagnostic steps
        - Suggest practical solutions with clear instructions
        - Mention potential causes of the issue
        - Use technical terminology appropriately but explain complex concepts
        - Format your response with clear headings and numbered steps
        
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
        [List the source URLs you referenced]
      `;
      
      // Generate response
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating IT support response with Gemini:', error);
      return this._getErrorResponse();
    }
  }
  
  /**
   * Format sources for inclusion in the prompt
   * @private
   */
  _formatSourcesForPrompt(sources) {
    if (!sources || sources.length === 0) {
      return 'No specific sources available. Please provide general IT support guidance based on best practices.';
    }
    
    return sources.map((source, index) => {
      // Truncate content to avoid token limits
      const truncatedContent = source.content.length > 800 
        ? `${source.content.substring(0, 800)}...` 
        : source.content;
        
      return `Source ${index + 1}: ${source.title}\n${truncatedContent}\nURL: ${source.url}`;
    }).join('\n\n');
  }
  
  /**
   * Get category-specific instructions
   * @private
   */
  _getCategoryInstructions(category) {
    const instructions = {
      hardware: 'FOCUS: This is a hardware-related issue. Include physical troubleshooting steps and hardware diagnostics.',
      software: 'FOCUS: This is a software-related issue. Include application-specific troubleshooting and software configuration advice.',
      network: 'FOCUS: This is a network-related issue. Include network diagnostics and connectivity troubleshooting.',
      security: 'FOCUS: This is a security-related issue. Emphasize security best practices and protection measures.',
      troubleshooting: 'FOCUS: This is a general troubleshooting issue. Provide systematic diagnostic steps.'
    };
    
    return category && instructions[category] 
      ? instructions[category] 
      : 'FOCUS: Provide general IT support guidance.';
  }
  
  /**
   * Get a fallback response for error situations
   * @private
   */
  _getErrorResponse() {
    return `## Technical Difficulty

I apologize, but I encountered a technical issue while generating a detailed response. Here are some general troubleshooting steps you can try:

1. Restart the affected device or application
2. Check for and install any pending updates
3. Verify network connectivity
4. Look for error messages and search for them online
5. Try accessing the resource from a different device

If the issue persists, please provide more details about your specific problem, and I'll try to assist you further.`;
  }
}

module.exports = new GeminiService();