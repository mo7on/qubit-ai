require('dotenv').config();
const AIResearchService = require('../services/ai-research.service');

async function testIntegration() {
  try {
    console.log('Testing AI Research Integration...');
    
    const query = "What are the latest developments in quantum computing?";
    console.log(`Processing query: "${query}"`);
    
    // Process the message to get response with sources
    console.log('\nFetching sources and generating response...');
    const startTime = Date.now();
    const result = await AIResearchService.processMessage(query);
    const endTime = Date.now();
    
    // Display the final result
    console.log('\n--- FINAL RESULT ---');
    console.log('Response:');
    console.log(result.response);
    
    console.log('\nSources:');
    result.sources.forEach((source, index) => {
      console.log(`\nSource ${index + 1}: ${source.title}`);
      console.log(`URL: ${source.url}`);
      console.log(`Excerpt: ${source.content.substring(0, 150)}...`);
    });
    
    console.log('\nMetadata:');
    console.log(`Timestamp: ${result.metadata.timestamp}`);
    console.log(`Source Count: ${result.metadata.sourceCount}`);
    console.log(`Total Processing Time: ${endTime - startTime}ms`);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testIntegration();