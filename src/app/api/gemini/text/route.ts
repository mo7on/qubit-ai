import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not defined in environment variables');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    let lastError;
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ data: text });
      } catch (error) {
        lastError = error;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }

    // If all retries failed, throw the last error
    throw lastError;
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again later." },
      { status: 500 }
    );
  }
}