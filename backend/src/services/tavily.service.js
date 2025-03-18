const axios = require('axios');

/**
 * Service for retrieving IT support sources using Tavily AI
 */
class TavilyService {
  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY;
    this.baseUrl = 'https://api.tavily.com';
  }

  /**
   * Search for IT support sources related to a query
   * @param {string} query - The user's IT support query
   * @param {string} category - Optional IT support category for better results
   * @returns {Promise<Array>} - Array of relevant sources
   */
  async getITSupportSources(query, category = null) {
    try {
      // Build search parameters
      const searchParams = {
        api_key: this.apiKey,
        query: this._enhanceQuery(query, category),
        search_depth: "advanced",
        include_domains: this._getDomainsForCategory(category),
        max_results: 5
      };
      
      // Execute search
      const response = await axios.post(`${this.baseUrl}/search`, searchParams);
      
      if (!response.data || !response.data.results) {
        console.warn('No results returned from Tavily API');
        return [];
      }
      
      // Process and return results
      return response.data.results.map(source => ({
        title: source.title,
        content: source.content,
        url: source.url,
        score: source.score || 0,
        published_date: source.published_date || null
      }));
    } catch (error) {
      console.error('Error fetching IT support sources from Tavily:', error.message);
      return [];
    }
  }
  
  /**
   * Enhance query with category-specific terms for better search results
   * @private
   */
  _enhanceQuery(query, category) {
    if (!category) return `IT support: ${query}`;
    
    const categoryPrefixes = {
      hardware: 'Computer hardware troubleshooting:',
      software: 'Software troubleshooting:',
      network: 'Network troubleshooting:',
      security: 'IT security issue:',
      troubleshooting: 'Technical troubleshooting:',
      general: 'IT support:'
    };
    
    const prefix = categoryPrefixes[category] || 'IT support:';
    return `${prefix} ${query}`;
  }
  
  /**
   * Get relevant domains based on IT support category
   * @private
   */
  _getDomainsForCategory(category) {
    // Base domains for all IT support queries
    const baseDomains = [
      "support.microsoft.com", 
      "docs.microsoft.com",
      "support.apple.com",
      "support.google.com"
    ];
    
    // Category-specific domains
    const categoryDomains = {
      hardware: ["support.hp.com", "support.dell.com", "support.lenovo.com"],
      software: ["docs.oracle.com", "support.office.com", "helpx.adobe.com"],
      network: ["support.cisco.com", "kb.netgear.com", "support.linksys.com"],
      security: ["security.symantec.com", "support.norton.com", "docs.microsoft.com/security"],
      troubleshooting: ["help.ubuntu.com", "support.mozilla.org"]
    };
    
    return category && categoryDomains[category] 
      ? [...baseDomains, ...categoryDomains[category]]
      : baseDomains;
  }
}

module.exports = new TavilyService();