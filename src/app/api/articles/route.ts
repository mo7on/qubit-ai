import { NextResponse } from 'next/server';
import type { Article } from '@/types/article';

// This is a mock implementation. In a real application, 
// you would fetch this data from your actual backend/database
export async function GET() {
  try {
    // Mock data - in a real app, this would come from your database
    const articles: Omit<Article, 'timestamp'>[] = [
      // Your backend articles would be here
    ];

    // Convert to proper Article objects with Date objects
    const formattedArticles = articles.map(article => ({
      ...article,
      timestamp: new Date(),
    }));

    return NextResponse.json(formattedArticles);
  } catch (error) {
    console.error('Error in articles API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}