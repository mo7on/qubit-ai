const express = require('express');
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Protected routes
router.use(authMiddleware.protect);

// Chat endpoints
router.post('/chat', chatController.processChat);
router.post('/conversation', chatController.createConversation);

module.exports = router;