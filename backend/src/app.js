const itSupportRoutes = require('./routes/it-support.routes');

// Routes
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/it-support', itSupportRoutes);