const express = require('express');
const conversationController = require('../controllers/conversation.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware.protect);

// Conversation routes
router.get('/', conversationController.getConversations);
router.post('/', conversationController.createConversation);

// Message routes
router.get('/:conversationId/messages', conversationController.getMessages);
router.post('/:conversationId/messages', conversationController.createMessage);

// Two-step process routes
router.post('/sources', conversationController.getSources);
router.post('/generate', conversationController.generateResponse);

module.exports = router;