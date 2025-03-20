const supabase = require('../config/supabase');

/**
 * Authentication service using Supabase
 */
class AuthService {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} userData - Additional user data
   * @returns {Promise<Object>} - User data
   */
  static async register(email, password, userData = {}) {
    try {
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      // Add additional user data to profiles table
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: email,
            ...userData,
            created_at: new Date(),
            updated_at: new Date()
          });
        
        if (profileError) throw profileError;
      }
      
      return authData;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }
  
  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Session data
   */
  static async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }
  
  /**
   * Logout a user
   * @param {string} token - Session token
   * @returns {Promise<void>}
   */
  static async logout(token) {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
    } catch (error) {
      console.error('Error logging out user:', error);
      throw error;
    }
  }
  
  /**
   * Get user by token
   * @param {string} token - Session token
   * @returns {Promise<Object>} - User data
   */
  static async getUserByToken(token) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error) throw error;
      
      return data.user;
    } catch (error) {
      console.error('Error getting user by token:', error);
      throw error;
    }
  }
  
  /**
   * Reset password
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  static async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
}

module.exports = AuthService;