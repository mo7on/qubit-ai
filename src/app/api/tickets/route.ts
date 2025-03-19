import { NextResponse } from 'next/server';

// Import from the correct path
import { getTicketsFromDatabase } from '@/lib/database';

export async function GET() {
  try {
    // Replace this with your actual database call
    const tickets = await getTicketsFromDatabase();
    
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket history' },
      { status: 500 }
    );
  }
}