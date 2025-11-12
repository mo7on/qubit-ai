const express = require('express');
const {
  processText,
  processImage,
  createChat,
  sendChatMessage,
} = require('../controllers/gemini');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.post('/text', processText);
router.post('/image', processImage);
router.post('/chat', createChat);
router.post('/chat/:chatId/message', sendChatMessage);

module.exports = router;