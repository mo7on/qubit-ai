import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not defined in environment variables');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Please provide a prompt' },
        { status: 400 }
      );
    }

    // For text-only input - use the correct model name
    // The model name might have changed in newer versions of the API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Make sure to pass the prompt correctly
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      data: text,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to get response from Gemini', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}