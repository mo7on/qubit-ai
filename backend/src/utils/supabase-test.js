const supabase = require('../config/supabase');

/**
 * Test Supabase connection and basic operations
 */
const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic query
    const { data, error } = await supabase
      .from('user_login')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }
    
    console.log('Connection successful!');
    console.log('Database tables are accessible');
    
    return true;
  } catch (error) {
    console.error('Unexpected error during connection test:', error);
    return false;
  }
};

module.exports = {
  testSupabaseConnection
};