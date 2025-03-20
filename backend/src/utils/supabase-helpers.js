/**
 * Utility functions for Supabase operations
 */

/**
 * Handle Supabase errors consistently
 * @param {Error} error - The error object from Supabase
 * @returns {Object} - Standardized error object
 */
const handleSupabaseError = (error) => {
  console.error('Supabase error:', error);
  return {
    error: {
      message: error.message || 'An unexpected error occurred',
      status: error.status || 500,
      code: error.code || 'unknown_error'
    }
  };
};

/**
 * Validate Supabase environment variables
 * @returns {boolean} - Whether all required variables are present
 */
const validateSupabaseEnv = () => {
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required Supabase environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
};

module.exports = {
  handleSupabaseError,
  validateSupabaseEnv
};