/**
 * Service for detecting if queries are within the IT support domain
 */
class DomainDetectionService {
  /**
   * Check if a query is related to IT support
   * @param {string} query - User query
   * @returns {boolean} - Whether the query is related to IT support
   */
  static isITSupportDomain(query) {
    try {
      if (!query || typeof query !== 'string') {
        return false;
      }

      // IT support domains and their related keywords
      const itSupportDomains = {
        hardware: [
          'computer', 'laptop', 'desktop', 'server', 'monitor', 'keyboard', 'mouse',
          'printer', 'scanner', 'usb', 'hard drive', 'ssd', 'ram', 'cpu', 'processor',
          'gpu', 'graphics card', 'motherboard', 'power supply', 'battery', 'charger',
          'adapter', 'cable', 'port', 'hdmi', 'vga', 'dvi', 'displayport', 'bluetooth',
          'wireless', 'device', 'driver', 'hardware'
        ],
        software: [
          'software', 'program', 'application', 'app', 'install', 'uninstall', 'update',
          'upgrade', 'windows', 'mac', 'linux', 'android', 'ios', 'office', 'excel',
          'word', 'powerpoint', 'outlook', 'browser', 'chrome', 'firefox', 'edge',
          'safari', 'operating system', 'os', 'version', 'license', 'activation'
        ],
        network: [
          'network', 'wifi', 'internet', 'connection', 'router', 'modem', 'ethernet',
          'ip address', 'dns', 'vpn', 'firewall', 'proxy', 'bandwidth', 'speed test',
          'latency', 'ping', 'packet loss', 'wireless', 'signal', 'hotspot', 'bluetooth'
        ],
        security: [
          'security', 'password', 'login', 'authentication', 'virus', 'malware',
          'ransomware', 'spyware', 'phishing', 'hack', 'breach', 'encryption',
          'firewall', 'antivirus', 'spam', 'backup', 'restore', 'recovery', 'permission',
          'access', 'admin', 'administrator', 'account'
        ],
        troubleshooting: [
          'error', 'bug', 'crash', 'blue screen', 'bsod', 'freeze', 'hang', 'slow',
          'performance', 'troubleshoot', 'fix', 'solve', 'resolve', 'repair', 'issue',
          'problem', 'not working', 'failed', 'boot', 'startup', 'shutdown', 'restart'
        ]
      };

      // Flatten the domains into a single array of keywords
      const allKeywords = Object.values(itSupportDomains).flat();
      
      // Convert query to lowercase for case-insensitive matching
      const lowercaseQuery = query.toLowerCase();
      
      // Check if any IT support keyword is in the query
      const containsITKeyword = allKeywords.some(keyword => 
        lowercaseQuery.includes(keyword.toLowerCase())
      );
      
      if (containsITKeyword) {
        // Log detection for analysis
        console.log(`IT keyword detected in query: "${query.substring(0, 50)}..."`);
        return true;
      }
      
      // Technical question patterns
      const technicalQuestionPatterns = [
        /how (do|can|to|would|should) .* (fix|solve|resolve|troubleshoot|repair|setup|configure|install)/i,
        /why (is|does|won't|can't|doesn't|isn't|didn't|couldn't) .* (work|connect|open|start|run|load|respond|function)/i,
        /what (is|are|causes|means|should|could|would) .* (error|issue|problem|bug|crash|message|code|setting)/i,
        /can('t| not)? .* (install|update|connect|access|login|reset|restore|backup|configure|setup)/i,
        /is there (a way|a method|a solution) to .* (fix|solve|resolve|troubleshoot|repair)/i,
        /trouble with .* (computer|laptop|device|software|hardware|network|connection|internet)/i,
        /need help .* (setting up|configuring|installing|fixing|troubleshooting|resolving)/i
      ];
      
      const matchesPattern = technicalQuestionPatterns.some(pattern => pattern.test(lowercaseQuery));
      
      if (matchesPattern) {
        console.log(`IT pattern detected in query: "${query.substring(0, 50)}..."`);
      } else {
        console.log(`Non-IT query detected: "${query.substring(0, 50)}..."`);
      }
      
      return matchesPattern;
    } catch (error) {
      console.error('Error in isITSupportDomain:', error);
      // Default to false in case of error
      return false;
    }
  }

  /**
   * Get a professional response for non-IT support queries
   * @returns {string} - Response message
   */
  static getNonITSupportResponse() {
    return `## Outside IT Support Scope

I specialize exclusively in providing IT technical support. Your query appears to be outside my area of expertise.

I can assist with:
• Hardware troubleshooting
• Software installation and configuration
• Network connectivity issues
• System performance optimization
• Security best practices
• Data backup and recovery

Please feel free to ask any IT-related technical questions, and I'll provide detailed assistance.`;
  }
  
  /**
   * Process a query through the IT support domain pipeline
   * @param {string} query - User query
   * @returns {Object} - Processing result with domain status and appropriate response
   */
  static async processQuery(query) {
    try {
      // Step 1: Check if query is IT-related
      const isITRelated = this.isITSupportDomain(query);
      
      // Create result object with domain status
      const result = {
        query,
        isITRelated,
        timestamp: new Date().toISOString(),
        sources: [],
        response: null
      };
      
      // Step 2: Handle non-IT queries immediately
      if (!isITRelated) {
        result.response = this.getNonITSupportResponse();
        return result;
      }
      
      // For IT-related queries, the calling code will handle Tavily and Gemini integration
      return result;
    } catch (error) {
      console.error('Error processing query through domain detection:', error);
      return {
        query,
        isITRelated: false,
        error: true,
        errorMessage: error.message,
        timestamp: new Date().toISOString(),
        response: 'I apologize, but I encountered a technical issue while processing your request. Please try again or contact our support team directly for immediate assistance.'
      };
    }
  }
  
  /**
   * Get the domain category of an IT support query
   * @param {string} query - User query
   * @returns {string|null} - Category name or null if not IT-related
   */
  static getITSupportCategory(query) {
    if (!query || typeof query !== 'string') {
      return null;
    }
    
    const lowercaseQuery = query.toLowerCase();
    
    // Check each domain category
    for (const [category, keywords] of Object.entries(this.itSupportDomains)) {
      if (keywords.some(keyword => lowercaseQuery.includes(keyword.toLowerCase()))) {
        return category;
      }
    }
    
    // Check if it matches any pattern but doesn't have a specific category
    if (this.technicalQuestionPatterns.some(pattern => pattern.test(lowercaseQuery))) {
      return 'general';
    }
    
    return null;
  }
}

// Create a singleton instance
const domainDetectionService = new DomainDetectionService();

// Export both the class and the singleton instance
module.exports = DomainDetectionService;
module.exports.default = DomainDetectionService;
module.exports.instance = domainDetectionService;

/**
 * Service for detecting if queries are within the specified domain
 */
class DomainDetectionService {
  /**
   * Check if a query is related to the specified domain
   * @param {string} query - User query
   * @returns {boolean} - Whether the query is within the domain
   */
  static isInDomain(query) {
    if (!query || typeof query !== 'string') {
      return false;
    }

    // Domain-specific keywords
    const domainKeywords = [
      // Add your domain-specific keywords here
      'computer', 'software', 'hardware', 'network', 'server',
      'database', 'programming', 'code', 'development', 'IT',
      'technology', 'system', 'application', 'website', 'internet'
    ];
    
    // Convert query to lowercase for case-insensitive matching
    const lowercaseQuery = query.toLowerCase();
    
    // Check if any domain keyword is in the query
    const containsDomainKeyword = domainKeywords.some(keyword => 
      lowercaseQuery.includes(keyword.toLowerCase())
    );
    
    if (containsDomainKeyword) {
      return true;
    }
    
    // Domain-specific question patterns
    const domainQuestionPatterns = [
      /how (do|can|to|would|should) .* (develop|program|code|implement|design)/i,
      /what (is|are|means) .* (algorithm|function|method|api|framework)/i,
      /why (is|does|won't) .* (code|program|application|system|website)/i
    ];
    
    return domainQuestionPatterns.some(pattern => pattern.test(lowercaseQuery));
  }

  /**
   * Get a professional response for out-of-domain queries
   * @returns {string} - Response message
   */
  static getOutOfDomainResponse() {
    return `I apologize, but your question appears to be outside the domain I'm designed to assist with. I specialize in technology and IT-related topics.

If you have any questions related to technology, programming, or IT support, I'd be happy to help.`;
  }
}

module.exports = DomainDetectionService;