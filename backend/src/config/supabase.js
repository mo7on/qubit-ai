const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required Supabase environment variables');
}

// Create Supabase client with optimized configuration
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
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
  }
});

// Test connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('user_login').select('count()', { count: 'exact' });
    if (error) throw error;
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};

// Initialize connection on startup
testConnection();

module.exports = supabase;