const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const DomainDetectionService = require('./domain-detection.service');
const DatabaseService = require('./database.service');

/**
 * Service for AI model integration with domain filtering
 */
class AIIntegrationService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    this.tavilyApiKey = process.env.TAVILY_API_KEY;
  }

  /**
   * Process a user message through the complete pipeline
   * @param {string} message - User message
   * @param {string} conversationId - Conversation ID for database storage
   * @returns {Promise<Object>} - Processing result
   */
  async processMessage(message, conversationId) {
    try {
      // Step 1: Domain detection
      const domainResult = await DomainDetectionService.processQuery(message);
      
      // Step 2: If not IT-related, return rejection
      if (!domainResult.isITRelated) {
        await this.storeMessageInDatabase(message, domainResult.response, conversationId, false);
        return {
          success: true,
          isITRelated: false,
          response: domainResult.response
        };
      }
      
      // Step 3: For IT-related queries, get sources from Tavily
      const sources = await this.getTavilySources(message);
      domainResult.sources = sources;
      
      // Step 4: Generate response with Gemini AI
      const aiResponse = await this.generateGeminiResponse(message, sources);
      domainResult.response = aiResponse;
      
      // Step 5: Store in database
      await this.storeMessageInDatabase(message, aiResponse, conversationId, true, sources);
      
      return {
        success: true,
        isITRelated: true,
        response: aiResponse,
        sources: sources
      };
    } catch (error) {
      console.error('Error processing message with AI:', error);
      return {
        success: false,
        error: true,
        response: 'I apologize, but I encountered a technical issue while processing your request. Please try again or contact our support team directly for immediate assistance.'
      };
    }
  }
  
  /**
   * Get relevant sources from Tavily AI
   * @param {string} query - User query
   * @returns {Promise<Array>} - Array of sources
   */
  async getTavilySources(query) {
    try {
      const response = await axios.post('https://api.tavily.com/search', {
        api_key: this.tavilyApiKey,
        query: query,
        search_depth: "advanced",
        include_domains: ["support.microsoft.com", "docs.microsoft.com", "apple.com/support", "support.google.com"],
        max_results: 3
      });
      
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching sources from Tavily:', error);
      return [];
    }
  }
  
  /**
   * Generate response using Gemini AI
   * @param {string} query - User query
   * @param {Array} sources - Sources from Tavily
   * @returns {Promise<string>} - Generated response
   */
  async generateGeminiResponse(query, sources) {
    try {
      // Format sources for the prompt
      const sourcesText = sources.length > 0 
        ? sources.map((s, i) => `Source ${i+1}: ${s.title}\n${s.content}\nURL: ${s.url}`).join('\n\n')
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
        
        RESPONSE FORMAT:
        1. Brief assessment of the issue
        2. Step-by-step troubleshooting process
        3. Potential solutions
        4. Additional recommendations
      `;
      
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating response with Gemini:', error);
      return 'I apologize, but I encountered a technical issue while generating a response. Here are some general troubleshooting steps you can try while I work on fixing this issue.';
    }
  }
  
  /**
   * Store message and response in database
   * @param {string} userMessage - User message
   * @param {string} aiResponse - AI response
   * @param {string} conversationId - Conversation ID
   * @param {boolean} isITRelated - Whether query was IT-related
   * @param {Array} sources - Sources used (optional)
   */
  async storeMessageInDatabase(userMessage, aiResponse, conversationId, isITRelated, sources = []) {
    try {
      // Store in database using your DatabaseService
      if (DatabaseService && DatabaseService.message && DatabaseService.message.create) {
        // Store user message
        await DatabaseService.message.create({
          conversation_id: conversationId,
          content: userMessage,
          role: 'user',
          created_at: new Date()
        });
        
        // Store AI response with metadata
        await DatabaseService.message.create({
          conversation_id: conversationId,
          content: aiResponse,
          role: 'assistant',
          metadata: {
            isITRelated,
            sources: sources.map(s => ({ title: s.title, url: s.url }))
          },
          created_at: new Date()
        });
        
        // Update conversation timestamp
        await DatabaseService.conversation.update(conversationId, {
          updated_at: new Date()
        });
      }
    } catch (error) {
      console.error('Error storing messages in database:', error);
    }
  }
}

module.exports = new AIIntegrationService();