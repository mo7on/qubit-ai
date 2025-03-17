const express = require('express');
const router = express.Router();
const aiIntegrationController = require('../controllers/ai-integration.controller');

// Routes for AI integration
router.post('/generate', aiIntegrationController.generateResponseWithSources);
router.post('/sources', aiIntegrationController.getSources);

module.exports = router;