const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Validation middleware
const validateQuery = [
  body('query').notEmpty().withMessage('Query is required').isString().withMessage('Query must be a string')
];

const validatePrompt = [
  body('prompt').notEmpty().withMessage('Prompt is required').isString().withMessage('Prompt must be a string')
];

const validateImage = [
  body('imageData').notEmpty().withMessage('Image data is required').isString().withMessage('Image data must be a string'),
  body('prompt').optional().isString().withMessage('Prompt must be a string')
];

// Public routes
router.post('/generate', validateQuery, aiController.generateResponseWithSources);
router.post('/sources', validateQuery, aiController.getSources);
router.post('/response', validatePrompt, aiController.generateResponse);
router.post('/analyze-image', validateImage, aiController.analyzeImage);

// Protected routes (require authentication)
router.post('/generate-auth', verifyToken, validateQuery, aiController.generateResponseWithSources);
router.post('/sources-auth', verifyToken, validateQuery, aiController.getSources);
router.post('/response-auth', verifyToken, validatePrompt, aiController.generateResponse);
router.post('/analyze-image-auth', verifyToken, validateImage, aiController.analyzeImage);
router.get('/history', verifyToken, aiController.getQueryHistory);

module.exports = router;