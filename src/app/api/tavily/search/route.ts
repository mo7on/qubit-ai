import { NextRequest, NextResponse } from 'next/server';

/**
 * Tavily Search API Handler
 * 
 * This endpoint proxies search requests to the Tavily API service
 * for retrieving relevant search results.
 */
export async function POST(request: NextRequest) {
  try {
    // Get the Tavily API key from environment variables
    const apiKey = process.env.TAVILY_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Tavily API key is not configured' },
        { status: 500 }
      );
    }

    // Parse the request body
    const body = await request.json();
    
    // Make request to Tavily API
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    // Get the response data
    const data = await response.json();
    
    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Tavily search API:', error);
    return NextResponse.json(
      { error: 'Failed to process search request' },
      { status: 500 }
    );
  }
}