const express = require('express');
const router = express.Router();
const aiResearchController = require('../controllers/ai-research.controller');

// Routes for AI research
router.post('/process', aiResearchController.processMessage);
router.post('/sources', aiResearchController.getSources);

module.exports = router;