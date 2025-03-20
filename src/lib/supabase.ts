import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

// Create Supabase client with optimized configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: fetch,
  },
  // Add request timeout to prevent hanging requests
  db: {
    schema: 'public',
  },
  realtime: {
    timeout: 30000, // 30 seconds timeout for realtime subscriptions
  },
  // Add request timeout to prevent hanging requests
  httpClient: {
    timeout: 15000, // 15 seconds timeout for HTTP requests
  },
});

// Helper function to handle Supabase errors consistently
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  return {
    error: {
      message: error.message || 'An unexpected error occurred',
      status: error.status || 500,
    },
  };
};

// Test connection function for server-side use
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return { success: false, error };
  }
};