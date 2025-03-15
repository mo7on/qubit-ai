const { GoogleGenerativeAI } = require('@google/generative-ai');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Process text input with Gemini
// @route   POST /api/gemini/text
// @access  Private
exports.processText = asyncHandler(async (req, res, next) => {
  const { prompt } = req.body;

  if (!prompt) {
    return next(new ErrorResponse('Please provide a prompt', 400));
  }

  // For text-only input
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  res.status(200).json({
    success: true,
    data: text,
  });
});

// @desc    Process image and text input with Gemini
// @route   POST /api/gemini/image
// @access  Private
exports.processImage = asyncHandler(async (req, res, next) => {
  const { prompt, image } = req.body;

  if (!prompt || !image) {
    return next(new ErrorResponse('Please provide both prompt and image', 400));
  }

  // For multimodal input (text + image)
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  
  // Convert base64 image to proper format for Gemini
  const imageData = {
    inlineData: {
      data: image.replace(/^data:image\/\w+;base64,/, ''),
      mimeType: image.match(/^data:(.*?);/)[1],
    },
  };

  const result = await model.generateContent([prompt, imageData]);
  const response = await result.response;
  const text = response.text();

  res.status(200).json({
    success: true,
    data: text,
  });
});

// @desc    Create a chat session with Gemini
// @route   POST /api/gemini/chat
// @access  Private
exports.createChat = asyncHandler(async (req, res, next) => {
  const { history } = req.body;

  // Initialize a chat model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const chat = model.startChat({
    history: history || [],
  });

  // Store chat session in memory (in a real app, you'd store this in a database)
  res.status(200).json({
    success: true,
    data: {
      chatId: Date.now().toString(), // This would be a DB ID in a real app
      history: history || [],
    },
  });
});

// @desc    Send message to existing chat
// @route   POST /api/gemini/chat/:chatId/message
// @access  Private
exports.sendChatMessage = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  const { chatId } = req.params;

  if (!message) {
    return next(new ErrorResponse('Please provide a message', 400));
  }

  // In a real app, you'd retrieve the chat session from a database
  // For simplicity, we're creating a new chat each time
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const chat = model.startChat();
  
  const result = await chat.sendMessage(message);
  const response = await result.response;
  const text = response.text();

  res.status(200).json({
    success: true,
    data: {
      chatId,
      message: text,
    },
  });
});