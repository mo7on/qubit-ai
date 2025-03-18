const { tavily } = require('@tavily/core');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

class TavilyService {
  constructor() {
    this.client = tavily({ 
      apiKey: process.env.TAVILY_API_KEY 
    });
  }

  /**
   * Search for information using Tavily AI
   * @param {string} query - User query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} - Search results
   */
  async search(query, options = {}) {
    try {
      const searchOptions = {
        query,
        search_depth: options?.searchDepth || "advanced",
        max_results: options?.maxResults || 5,
        include_domains: options?.includeDomains || [],
        exclude_domains: options?.excludeDomains || []
      };
      
      const response = await this.client.search(searchOptions);
      return response;
    } catch (error) {
      console.error('Error in Tavily search:', error);
      throw new Error(`Failed to fetch results from Tavily: ${error.message}`);
    }
  }
}

// Export a singleton instance
module.exports = new TavilyService();