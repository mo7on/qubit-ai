const express = require('express');
const conversationController = require('../controllers/conversation.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Protected routes
router.use(authMiddleware.protect);

router.get('/', conversationController.getConversations);
router.post('/', conversationController.createConversation);
router.get('/:conversationId/messages', conversationController.getMessages);
router.post('/:conversationId/messages', conversationController.createMessage);
router.get('/:conversationId/status', conversationController.checkConversationStatus);

// Two-step process routes
router.post('/sources', conversationController.getSources);
router.post('/generate', conversationController.generateResponse);

module.exports = router;