/**
 * Configuration for AI services
 */
module.exports = {
  gemini: {
    model: "gemini-2.0-flash",
    temperature: 0.7,
    topP: 0.8,
    maxOutputTokens: 2048,
  },
  tavily: {
    maxResults: 5,
    searchDepth: "advanced",
    includeDomains: [],
    excludeDomains: []
  },
  cache: {
    ttl: 3600000, // 1 hour in milliseconds
    maxSize: 100  // Maximum number of cached items
  }
};