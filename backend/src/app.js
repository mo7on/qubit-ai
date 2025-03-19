const itSupportRoutes = require('./routes/it-support.routes');
const messageRoutes = require('./routes/message.routes');
const articleRoutes = require('./routes/article.routes');
const systemRoutes = require('./routes/system.routes');
const chatRoutes = require('./routes/chat.routes');
const { scheduleArticleGeneration } = require('./cron/article-generator');

// Routes
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/system', systemRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/chat', chatRoutes);

// Start cron jobs in production environment
if (process.env.NODE_ENV === 'production') {
  scheduleArticleGeneration();
}

// Remove the IT support routes since we're integrating that functionality into the message service
// app.use('/api/v1/it-support', itSupportRoutes);