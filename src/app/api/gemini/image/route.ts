import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with API key
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

    const { imageData, prompt } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'Please provide image data' },
        { status: 400 }
      );
    }

    // For image processing, use the multimodal model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Prepare the parts with both text and image
    const parts = [
      { text: prompt || "Analyze this image and provide IT support assistance if needed:" },
      {
        inlineData: {
          data: imageData,
          mimeType: "image/jpeg" // Assuming JPEG format
        }
      }
    ];
    
    // Generate content with the provided image and prompt
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts
      }]
    });
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      data: text,
    });
  } catch (error) {
    console.error('Error processing image request:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image with Gemini', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}