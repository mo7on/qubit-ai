/**
 * Service for detecting if queries are within the IT support domain
 * and extracting device information
 */
class DomainDetectionService {
  constructor() {
    // IT support domains and their related keywords
    this.itSupportDomains = {
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

    // Technical question patterns
    this.technicalQuestionPatterns = [
      /how (do|can|to|would|should) .* (fix|solve|resolve|troubleshoot|repair|setup|configure|install)/i,
      /why (is|does|won't|can't|doesn't|isn't|didn't|couldn't) .* (work|connect|open|start|run|load|respond|function)/i,
      /what (is|are|causes|means|should|could|would) .* (error|issue|problem|bug|crash|message|code|setting)/i,
      /can('t| not)? .* (install|update|connect|access|login|reset|restore|backup|configure|setup)/i,
      /is there (a way|a method|a solution) to .* (fix|solve|resolve|troubleshoot|repair)/i,
      /trouble with .* (computer|laptop|device|software|hardware|network|connection|internet)/i,
      /need help .* (setting up|configuring|installing|fixing|troubleshooting|resolving)/i
    ];
    
    // Device brands
    this.deviceBrands = [
      'hp', 'dell', 'lenovo', 'apple', 'mac', 'macbook', 'imac', 'asus', 'acer',
      'microsoft', 'surface', 'samsung', 'toshiba', 'sony', 'vaio', 'lg',
      'chromebook', 'google', 'huawei', 'msi', 'razer', 'alienware', 'fujitsu'
    ];
  }

  /**
   * Check if a query is related to IT support
   * @param {string} query - User query
   * @returns {boolean} - Whether the query is related to IT support
   */
  isITSupportDomain(query) {
    try {
      if (!query || typeof query !== 'string') {
        return false;
      }

      // Convert query to lowercase for case-insensitive matching
      const lowercaseQuery = query.toLowerCase();
      
      // Flatten the domains into a single array of keywords
      const allKeywords = Object.values(this.itSupportDomains).flat();
      
      // Check if any IT support keyword is in the query
      const containsITKeyword = allKeywords.some(keyword => 
        lowercaseQuery.includes(keyword.toLowerCase())
      );
      
      if (containsITKeyword) {
        // Log detection for analysis
        console.log(`IT keyword detected in query: "${query.substring(0, 50)}..."`);
        return true;
      }
      
      // Check for technical question patterns
      const matchesPattern = this.technicalQuestionPatterns.some(pattern => 
        pattern.test(lowercaseQuery)
      );
      
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
  getNonITSupportResponse() {
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
   * Get the domain category of an IT support query
   * @param {string} query - User query
   * @returns {string|null} - Category name or null if not IT-related
   */
  getITSupportCategory(query) {
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

  /**
   * Extract device brand information from a query
   * @param {string} query - User query
   * @returns {string|null} - Device brand or null if not detected
   */
  extractDeviceBrand(query) {
    if (!query || typeof query !== 'string') {
      return null;
    }
    
    const lowercaseQuery = query.toLowerCase();
    
    // Extract device brand if present
    for (const brand of this.deviceBrands) {
      if (lowercaseQuery.includes(brand)) {
        // For Apple products, be more specific if possible
        if (brand === 'apple' || brand === 'mac') {
          if (lowercaseQuery.includes('macbook')) {
            return 'MacBook';
          } else if (lowercaseQuery.includes('imac')) {
            return 'iMac';
          } else if (lowercaseQuery.includes('mac')) {
            return 'Mac';
          } else {
            return 'Apple';
          }
        } else {
          // Capitalize first letter of brand
          return brand.charAt(0).toUpperCase() + brand.slice(1);
        }
      }
    }
    
    return null;
  }
  
  /**
   * Analyze message for IT Support relevance and extract device information
   * @param {string} message - User message
   * @returns {Object} - Analysis result with isITSupport flag and device info
   */
  analyzeMessage(message) {
    if (!message) {
      return {
        isITSupport: false,
        deviceBrand: null,
        category: null
      };
    }
    
    const isITSupport = this.isITSupportDomain(message);
    const deviceBrand = this.extractDeviceBrand(message);
    const category = isITSupport ? this.getITSupportCategory(message) : null;
    
    return {
      isITSupport,
      deviceBrand,
      category
    };
  }
}

// Create a singleton instance
const domainDetectionService = new DomainDetectionService();

// Export the singleton instance
module.exports = domainDetectionService;