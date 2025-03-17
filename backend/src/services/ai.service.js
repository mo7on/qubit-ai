const { GoogleGenerativeAI } = require('@google/generative-ai');
const { TavilySearchAPIRetriever } = require('tavily-js');
const logger = require('../utils/logger');
const cache = require('../utils/cache');
const { performance } = require('perf_hooks');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-pro",
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    }
  ],
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  }
});

// Initialize Tavily AI with configurable options
const tavilyRetriever = new TavilySearchAPIRetriever({
  apiKey: process.env.TAVILY_API_KEY,
  maxResults: parseInt(process.env.TAVILY_MAX_RESULTS || '5'),
  searchDepth: process.env.TAVILY_SEARCH_DEPTH || 'advanced',
  includeRawContent: true,
  includeImages: false
});

// Cache TTL in seconds
const CACHE_TTL = 3600; // 1 hour

class AIService {
  /**
   * Get sources from Tavily AI based on a query
   * @param {string} query - The user's query
   * @param {Object} options - Additional options for the search
   * @returns {Promise<Array>} - Array of sources
   */
  static async getSources(query, options = {}) {
    const startTime = performance.now();
    const cacheKey = `tavily:${query}:${JSON.stringify(options)}`;
    
    try {
      // Check cache first
      const cachedResults = await cache.get(cacheKey);
      if (cachedResults) {
        logger.info(`Cache hit for Tavily query: ${query}`);
        return JSON.parse(cachedResults);
      }
      
      // Configure search parameters
      const searchParams = {
        query,
        ...options
      };
      
      logger.info(`Fetching sources from Tavily for query: ${query}`);
      const searchResults = await tavilyRetriever.invoke(searchParams);
      
      // Format the sources
      const formattedSources = searchResults.map(result => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score,
        published_date: result.published_date || null
      }));
      
      // Cache the results
      await cache.set(cacheKey, JSON.stringify(formattedSources), CACHE_TTL);
      
      const duration = ((performance.now() - startTime) / 1000).toFixed(2);
      logger.info(`Tavily search completed in ${duration}s with ${formattedSources.length} results`);
      
      return formattedSources;
    } catch (error) {
      const duration = ((performance.now() - startTime) / 1000).toFixed(2);
      logger.error(`Error fetching sources from Tavily (${duration}s): ${error.message}`, { 
        error, 
        query, 
        options 
      });
      
      throw new Error(`Failed to fetch sources: ${error.message}`);
    }
  }

  /**
   * Generate a response using Gemini AI with sources from Tavily
   * @param {string} query - The user's query
   * @param {Array} sources - Sources from Tavily
   * @param {Object} options - Additional options for generation
   * @returns {Promise<string>} - Generated response
   */
  static async generateResponse(query, sources, options = {}) {
    const startTime = performance.now();
    
    try {
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
        4. Focus on factual information and avoid speculation.
        5. Format your response in markdown for better readability.
        6. If appropriate, structure your response with headings, bullet points, or numbered lists.
        
        Your response:
      `;
      
      logger.info(`Generating Gemini response for query: ${query}`);
      
      // Apply custom generation options if provided
      const generationOptions = options.generationConfig || {};
      
      // Generate response with Gemini
      const result = await geminiModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          ...geminiModel.generationConfig,
          ...generationOptions
        }
      });
      
      const response = await result.response;
      const responseText = response.text();
      
      const duration = ((performance.now() - startTime) / 1000).toFixed(2);
      logger.info(`Gemini response generated in ${duration}s`);
      
      return responseText;
    } catch (error) {
      const duration = ((performance.now() - startTime) / 1000).toFixed(2);
      logger.error(`Error generating response with Gemini (${duration}s): ${error.message}`, { 
        error, 
        query 
      });
      
      // Handle specific Gemini API errors
      if (error.message.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later.');
      }
      
      if (error.message.includes('safety')) {
        throw new Error('The request was blocked due to safety concerns with the query.');
      }
      
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }
  }

  /**
   * Main integration function that combines Tavily sources with Gemini responses
   * @param {string} query - The user's query
   * @param {Object} options - Additional options for processing
   * @returns {Promise<Object>} - Combined result with response and sources
   */
  static async getResponseWithSources(query, options = {}) {
    const startTime = performance.now();
    const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    logger.info(`[${requestId}] Processing AI query: ${query}`);
    
    try {
      // Step 1: Get sources from Tavily
      const sources = await this.getSources(query, options.tavily || {});
      
      if (!sources || sources.length === 0) {
        logger.warn(`[${requestId}] No sources found for query: ${query}`);
        return {
          query,
          response: "I couldn't find any relevant sources to answer your question accurately. Please try rephrasing your query or asking something else.",
          sources: []
        };
      }
      
      // Step 2: Generate response with Gemini using the sources
      const response = await this.generateResponse(query, sources, options.gemini || {});
      
      const duration = ((performance.now() - startTime) / 1000).toFixed(2);
      logger.info(`[${requestId}] AI query processed successfully in ${duration}s`);
      
      // Step 3: Return combined result
      return {
        query,
        response,
        sources,
        metadata: {
          processingTime: duration,
          sourceCount: sources.length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      const duration = ((performance.now() - startTime) / 1000).toFixed(2);
      logger.error(`[${requestId}] Error in AI integration (${duration}s): ${error.message}`, { 
        error, 
        query, 
        options 
      });
      
      throw error;
    }
  }
}

module.exports = AIService;