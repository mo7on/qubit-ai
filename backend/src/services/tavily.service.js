const axios = require('axios');

/**
 * Service for interacting with Tavily AI for research and source retrieval
 */
class TavilyService {
  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY;
    this.baseUrl = 'https://api.tavily.com';
  }

  /**
   * Search for sources related to a query
   * @param {string} query - The search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Array of sources
   */
  async searchSources(query, options = {}) {
    try {
      const defaultOptions = {
        search_depth: "advanced",
        include_domains: ["support.microsoft.com", "docs.microsoft.com", "apple.com/support", 
                         "support.google.com", "help.ubuntu.com", "support.hp.com", 
                         "support.dell.com", "technet.microsoft.com"],
        max_results: 5
      };

      const searchOptions = { ...defaultOptions, ...options };
      
      const response = await axios.post(`${this.baseUrl}/search`, {
        api_key: this.apiKey,
        query: query,
        ...searchOptions
      });
      
      if (response.data && response.data.results) {
        // Format the sources for easier consumption
        return response.data.results.map(source => ({
          title: source.title,
          content: source.content,
          url: source.url,
          score: source.score,
          published_date: source.published_date
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching sources from Tavily:', error.message);
      // Return empty array on error
      return [];
    }
  }
}

module.exports = new TavilyService();