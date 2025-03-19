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
  conversation: {
    maxResponses: 10, // Maximum number of AI responses per conversation
    autoClose: true   // Automatically close conversations when limit is reached
  },
  cache: {
    ttl: 3600000, // 1 hour in milliseconds
    maxSize: 100  // Maximum number of cached items
  }
};