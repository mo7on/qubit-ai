const express = require('express');
const { testSupabaseConnection } = require('../utils/supabase-test');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public route to check system status
router.get('/status', async (req, res) => {
  try {
    // Test database connection
    const dbConnected = await testSupabaseConnection();
    
    res.status(200).json({
      status: 'success',
      data: {
        server: 'running',
        database: dbConnected ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('Error checking system status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error checking system status'
    });
  }
});

// Protected route for more detailed status (admin only)
router.get('/status/detailed', 
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  async (req, res) => {
    try {
      // Test database connection
      const dbConnected = await testSupabaseConnection();
      
      res.status(200).json({
        status: 'success',
        data: {
          server: {
            status: 'running',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version
          },
          database: {
            connected: dbConnected,
            provider: 'Supabase',
            url: process.env.SUPABASE_URL
          },
          environment: process.env.NODE_ENV
        }
      });
    } catch (error) {
      console.error('Error checking detailed system status:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error checking detailed system status'
      });
    }
  }
);

module.exports = router;