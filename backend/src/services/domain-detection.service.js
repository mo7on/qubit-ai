const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Service for detecting if queries are within the IT support domain
 */
class DomainDetectionService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Device brands for detection
    this.deviceBrands = [
      'hp', 'dell', 'lenovo', 'apple', 'mac', 'macbook', 'imac', 'asus', 'acer',
      'microsoft', 'surface', 'samsung', 'toshiba', 'sony', 'vaio', 'lg',
      'chromebook', 'google', 'huawei', 'msi', 'razer', 'alienware', 'fujitsu'
    ];
  }

  /**
   * Check if a message is related to IT Support using Gemini AI
   * @param {string} message - User message
   * @returns {Promise<boolean>} - Whether the message is IT Support related
   */
  async isRelatedToITSupport(message) {
    try {
      if (!message || typeof message !== 'string') {
        return false;
      }

      const classificationPrompt = `
        You are an expert classifier. Classify the following message as either "IT Support" or "Not IT Support".
        Only respond with one of these two classifications, nothing else.
        
        Message: "${message}"
        
        Classification:
      `;

      const result = await this.model.generateContent(classificationPrompt);
      const response = result.response.text().trim();
      
      console.log(`Classification for message: "${message.substring(0, 50)}..." => "${response}"`);
      
      return response.toLowerCase().includes("it support");
    } catch (error) {
      console.error('Error classifying message:', error);
      // Default to true in case of error to avoid false rejections
      return true;
    }
  }

  /**
   * Get a professional response for non-IT support queries
   * @returns {string} - Response message
   */
  getNonITSupportResponse() {
    return `This system is only for IT Support-related inquiries.`;
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
   * @returns {Promise<Object>} - Analysis result with isITSupport flag and device info
   */
  async analyzeMessage(message) {
    if (!message) {
      return {
        isITSupport: false,
        deviceBrand: null
      };
    }
    
    const isITSupport = await this.isRelatedToITSupport(message);
    const deviceBrand = this.extractDeviceBrand(message);
    
    return {
      isITSupport,
      deviceBrand
    };
  }
}

// Create a singleton instance
const domainDetectionService = new DomainDetectionService();

// Export the singleton instance
module.exports = domainDetectionService;
