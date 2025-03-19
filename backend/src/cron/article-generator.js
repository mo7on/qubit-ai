const cron = require('node-cron');
const ArticleService = require('../services/article.service');

/**
 * Schedule article generation
 * Runs at 3:00 AM every day
 */
const scheduleArticleGeneration = () => {
  // Schedule: minute hour day-of-month month day-of-week
  // '0 3 * * *' = At 03:00 AM every day
  cron.schedule('0 3 * * *', async () => {
    console.log('Running scheduled article generation...');
    try {
      const articles = await ArticleService.generateAndSaveArticles(2);
      console.log(`Successfully generated ${articles.length} articles`);
    } catch (error) {
      console.error('Error in scheduled article generation:', error);
    }
  });
  
  console.log('Article generation scheduled to run at 3:00 AM daily');
};

module.exports = {
  scheduleArticleGeneration
};