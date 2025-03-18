const ITSupportService = require('../services/it-support.service');
const DatabaseService = require('../services/database.service');

/**
 * Controller for IT support endpoints
 */
exports.processQuery = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Query is required'
      });
    }
    
    // Process query through complete pipeline
    const result = await ITSupportService.processQuery(query);
    
    // Store in database if user is authenticated
    if (req.user && req.user.id) {
      await storeQueryInDatabase(query, result, req.user.id);
    }
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error processing IT support query:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error processing your query'
    });
  }
};

/**
 * Step 1: Get sources for a query
 */
exports.getSources = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Query is required'
      });
    }
    
    // Get sources for query
    const result = await ITSupportService.getSources(query);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error getting sources for query:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving sources'
    });
  }
};

/**
 * Step 2: Generate response based on sources
 */
exports.generateResponse = async (req, res) => {
  try {
    const { query, sources, category, conversationId } = req.body;
    
    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Query is required'
      });
    }
    
    // Generate response based on sources
    const result = await ITSupportService.generateResponse(query, sources || [], category);
    
    // Store in database if conversation ID is provided and user is authenticated
    if (conversationId && req.user && req.user.id) {
      await storeResponseInDatabase(query, result.response, sources, conversationId);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        response: result.response
      }
    });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error generating response'
    });
  }
};

/**
 * Store query and result in database
 * @private
 */
async function storeQueryInDatabase(query, result, userId) {
  try {
    // Create a new conversation if needed
    const conversation = await DatabaseService.conversation.create({
      user_id: userId,
      title: generateConversationTitle(query),
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // Store user message
    await DatabaseService.message.create({
      conversation_id: conversation.id,
      content: query,
      role: 'user',
      created_at: new Date()
    });
    
    // Store assistant response
    await DatabaseService.message.create({
      conversation_id: conversation.id,
      content: result.response,
      role: 'assistant',
      metadata: {
        isITRelated: result.isITRelated,
        category: result.category,
        sources: result.sources.map(s => ({ title: s.title, url: s.url }))
      },
      created_at: new Date()
    });
  } catch (error) {
    console.error('Error storing query in database:', error);
  }
}

/**
 * Store response in existing conversation
 * @private
 */
async function storeResponseInDatabase(query, response, sources, conversationId) {
  try {
    // Store user message
    await DatabaseService.message.create({
      conversation_id: conversationId,
      content: query,
      role: 'user',
      created_at: new Date()
    });
    
    // Store assistant response
    await DatabaseService.message.create({
      conversation_id: conversationId,
      content: response,
      role: 'assistant',
      metadata: {
        sources: sources.map(s => ({ title: s.title, url: s.url }))
      },
      created_at: new Date()
    });
    
    // Update conversation timestamp
    await DatabaseService.conversation.update(conversationId, {
      updated_at: new Date()
    });
  } catch (error) {
    console.error('Error storing response in database:', error);
  }
}

/**
 * Generate a conversation title from the query
 * @private
 */
function generateConversationTitle(query) {
  // Truncate query to create a title
  const maxLength = 50;
  let title = query.trim();
  
  if (title.length > maxLength) {
    title = title.substring(0, maxLength) + '...';
  }
  
  return title;
}