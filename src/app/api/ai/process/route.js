import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TavilySearchAPIRetriever } from 'tavily-js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });

// Initialize Tavily AI
const tavilyRetriever = new TavilySearchAPIRetriever({
  apiKey: process.env.TAVILY_API_KEY,
  maxResults: 5,
  searchDepth: "advanced"
});

/**
 * Get sources from Tavily AI
 */
async function getSources(query) {
  try {
    console.log(`Fetching sources for query: ${query}`);
    const results = await tavilyRetriever.invoke(query);
    
    return results.map(source => ({
      title: source.title,
      url: source.url,
      content: source.content,
      score: source.score
    }));
  } catch (error) {
    console.error('Error fetching sources:', error);
    throw new Error(`Failed to fetch sources: ${error.message}`);
  }
}

/**
 * Generate response with Gemini AI
 */
async function generateResponse(query, sources) {
  try {
    console.log(`Generating response for query: ${query}`);
    
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
      4. Format your response in markdown for better readability.
      5. If appropriate, structure your response with headings, bullet points, or numbered lists.
    `;
    
    // Generate response with Gemini
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

export async function POST(request) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { status: 'error', message: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Step 1: Get sources from Tavily
    const sources = await getSources(message);
    
    if (!sources || sources.length === 0) {
      return NextResponse.json({
        status: 'success',
        data: {
          query: message,
          response: "I couldn't find any relevant sources to answer your question accurately. Please try rephrasing your query or asking something else.",
          sources: []
        }
      });
    }
    
    // Step 2: Generate response with Gemini using the sources
    const response = await generateResponse(message, sources);
    
    // Step 3: Return combined result
    return NextResponse.json({
      status: 'success',
      data: {
        query: message,
        response,
        sources,
        metadata: {
          timestamp: new Date().toISOString(),
          sourceCount: sources.length
        }
      }
    });
  } catch (error) {
    console.error('Error processing message:', error);
    
    return NextResponse.json(
      { status: 'error', message: error.message || 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}