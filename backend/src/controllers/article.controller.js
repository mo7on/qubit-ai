const ArticleService = require('../services/article.service');
const DatabaseService = require('../services/database.service');

/**
 * Article controller
 */
exports.getArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10, tag } = req.query;
    
    // Get articles with pagination
    const articles = await DatabaseService.article.getAll({
      page: parseInt(page),
      limit: parseInt(limit),
      tag
    });
    
    res.status(200).json({
      status: 'success',
      results: articles.length,
      data: {
        articles
      }
    });
  } catch (error) {
    console.error('Error getting articles:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving articles'
    });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const { articleId } = req.params;
    
    const article = await DatabaseService.article.getById(articleId);
    
    if (!article) {
      return res.status(404).json({
        status: 'error',
        message: 'Article not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        article
      }
    });
  } catch (error) {
    console.error('Error getting article:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving article'
    });
  }
};

exports.generateArticles = async (req, res) => {
  try {
    const { count = 2 } = req.body;
    
    // Generate and save articles
    const articles = await ArticleService.generateAndSaveArticles(count);
    
    res.status(201).json({
      status: 'success',
      results: articles.length,
      data: {
        articles
      }
    });
  } catch (error) {
    console.error('Error generating articles:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error generating articles'
    });
  }
};