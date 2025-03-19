const axios = require('axios');

/**
 * Service for interacting with external AI API
 */
class ExternalAPIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  /**
   * Send a query to the external API
   * @param {string} query - User query
   * @returns {Promise<string>} - API response
   */
  async processQuery(query) {
    try {
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                { text: query }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        }
      );

      // Extract the response text
      if (response.data && 
          response.data.candidates && 
          response.data.candidates[0] && 
          response.data.candidates[0].content && 
          response.data.candidates[0].content.parts && 
          response.data.candidates[0].content.parts[0]) {
        return response.data.candidates[0].content.parts[0].text;
      }
      
      throw new Error('Unexpected API response format');
    } catch (error) {
      console.error('Error calling external API:', error);
      throw error;
    }
  }
}

module.exports = new ExternalAPIService();