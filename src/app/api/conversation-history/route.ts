import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch conversation history from backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/conversations/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getBackendToken(supabase)}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch history from backend');
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      status: 'success',
      data: {
        history: data.data.history || []
      }
    });
  } catch (error: any) {
    console.error('Error in conversation history API:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get backend token
async function getBackendToken(supabase: any) {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || '';
}