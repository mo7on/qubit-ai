const express = require('express');
const articleController = require('../controllers/article.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', articleController.getArticles);
router.get('/:articleId', articleController.getArticleById);

// Protected routes (admin only)
router.post('/generate', 
  authMiddleware.protect, 
  authMiddleware.restrictTo('admin'), 
  articleController.generateArticles
);

module.exports = router;