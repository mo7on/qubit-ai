const { GoogleGenerativeAI } = require('@google/generative-ai');
const { TavilySearchAPIRetriever } = require('tavily-js');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });

// Initialize Tavily AI
const tavilyRetriever = new TavilySearchAPIRetriever({
  apiKey: process.env.TAVILY_API_KEY,
  maxResults: 5
});

/**
 * Service for integrating Gemini AI and Tavily AI
 */
class AIIntegrationService {
  /**
   * Get relevant sources from Tavily AI
   * @param {string} query - User query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Array of sources
   */
  static async getSources(query, options = {}) {
    try {
      console.log(`Fetching sources for query: ${query}`);
      
      const searchOptions = {
        query,
        search_depth: options.searchDepth || "advanced",
        max_results: options.maxResults || 5,
        include_domains: options.includeDomains || [],
        exclude_domains: options.excludeDomains || []
      };
      
      const results = await tavilyRetriever.invoke(searchOptions);
      
      // Format the sources
      return results.map(result => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score,
        published_date: result.published_date || null
      }));
    } catch (error) {
      console.error('Error fetching sources from Tavily:', error);
      throw new Error(`Failed to fetch sources: ${error.message}`);
    }
  }

  /**
   * Generate a response using Gemini AI with sources
   * @param {string} query - User query
   * @param {Array} sources - Sources from Tavily
   * @returns {Promise<string>} - Generated response
   */
  static async generateResponse(query, sources) {
    try {
      console.log(`Generating response for query: ${query} with ${sources.length} sources`);
      
      // Format sources for the prompt
      const sourcesText = sources.map((source, index) => 
        `Source ${index + 1}: ${source.title}\nURL: ${source.url}\nContent: ${source.content}\n`
      ).join('\n');
      
      // Create prompt with query and sources
      const prompt = `
        You are a helpful AI research assistant that provides accurate, factual information.
        
        Answer the following query based on these sources:
        
        Query: ${query}
        
        Sources:
        ${sourcesText}
        
        Instructions:
        1. Provide a comprehensive answer that synthesizes information from the sources.
        2. Include relevant citations to the sources in your response using [Source X] notation.
        3. If the sources don't contain enough information to answer the query, please state that clearly.
        4. Format your response in markdown for better readability.
        5. If appropriate, structure your response with headings, bullet points, or numbered lists.
      `;
      
      // Generate response with Gemini
      const result = await geminiModel.generateContent(prompt);
      const response = result.response;
      
      return response.text();
    } catch (error) {
      console.error('Error generating response with Gemini:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Main integration function
   * @param {string} query - User query
   * @param {Object} options - Options for processing
   * @returns {Promise<Object>} - Combined result with response and sources
   */
  static async getResponseWithSources(query, options = {}) {
    try {
      // Step 1: Get sources from Tavily
      const sources = await this.getSources(query, options.tavily || {});
      
      if (!sources || sources.length === 0) {
        return {
          query,
          response: "I couldn't find any relevant sources to answer your question accurately. Please try rephrasing your query or asking something else.",
          sources: []
        };
      }
      
      // Step 2: Generate response with Gemini using the sources
      const response = await this.generateResponse(query, sources);
      
      // Step 3: Return combined result
      return {
        query,
        response,
        sources,
        metadata: {
          timestamp: new Date().toISOString(),
          sourceCount: sources.length
        }
      };
    } catch (error) {
      console.error('Error in AI integration:', error);
      throw error;
    }
  }
}

module.exports = AIIntegrationService;