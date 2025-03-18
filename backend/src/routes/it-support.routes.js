const express = require('express');
const itSupportController = require('../controllers/it-support.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware
router.use(authMiddleware.protect);

// One-step process endpoint
router.post('/query', itSupportController.processQuery);

// Two-step process endpoints
router.post('/sources', itSupportController.getSources);
router.post('/generate', itSupportController.generateResponse);

module.exports = router;