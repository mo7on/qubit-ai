const jwt = require('jsonwebtoken');
const db = require('./models');

module.exports = (io) => {
  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.username = decoded.username;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.username} (${socket.userId})`);
    
    // Join a problem room
    socket.on('join-problem', (problemId) => {
      socket.join(`problem:${problemId}`);
      console.log(`${socket.username} joined problem room: ${problemId}`);
    });
    
    // Leave a problem room
    socket.on('leave-problem', (problemId) => {
      socket.leave(`problem:${problemId}`);
      console.log(`${socket.username} left problem room: ${problemId}`);
    });
    
    // New solution added
    socket.on('new-solution', async (data) => {
      try {
        const { problemId, solution } = data;
        
        // Broadcast to all users in the problem room
        socket.to(`problem:${problemId}`).emit('solution-added', {
          solution,
          username: socket.username,
          userId: socket.userId,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Socket error:', error);
      }
    });
    
    // Problem status updated
    socket.on('problem-status-update', (data) => {
      const { problemId, status } = data;
      
      socket.to(`problem:${problemId}`).emit('status-updated', {
        problemId,
        status,
        updatedBy: socket.username,
        timestamp: new Date()
      });
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.username} (${socket.userId})`);
    });
  });
};