const express = require('express');
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middleware/auth.middleware');
const domainCheckMiddleware = require('../middleware/domain-check.middleware');

const router = express.Router();

// Apply authentication middleware
router.use(authMiddleware.protect);

// Apply domain check middleware to message processing endpoints
router.post('/process', domainCheckMiddleware.checkITSupportDomain, messageController.processMessage);
router.post('/:conversationId', domainCheckMiddleware.checkITSupportDomain, messageController.createMessage);

module.exports = router;