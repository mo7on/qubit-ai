require('dotenv').config();
const DatabaseService = require('../services/database.service');

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test user_login table
    console.log('\nTesting user_login table...');
    const users = await DatabaseService.executeRawQuery('SELECT COUNT(*) FROM user_login');
    console.log(`User count: ${users[0].count}`);
    
    // Test conversation table
    console.log('\nTesting conversation table...');
    const conversations = await DatabaseService.executeRawQuery('SELECT COUNT(*) FROM conversation');
    console.log(`Conversation count: ${conversations[0].count}`);
    
    // Test message table
    console.log('\nTesting message table...');
    const messages = await DatabaseService.executeRawQuery('SELECT COUNT(*) FROM message');
    console.log(`Message count: ${messages[0].count}`);
    
    console.log('\nSupabase connection test completed successfully!');
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
  }
}

testSupabaseConnection();