const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to generate text response from Gemini
async function generateTextResponse(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating text with Gemini:', error);
    throw new Error('Failed to generate response from AI');
  }
}

// Function to analyze image and generate response
async function analyzeImageAndGenerateResponse(imageData, prompt) {
  try {
    // For image processing, we use the multimodal model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Prepare the parts with both text and image
    const parts = [
      { text: prompt || "Analyze this image and provide detailed insights:" },
      {
        inlineData: {
          data: imageData,
          mimeType: "image/jpeg" // Adjust based on your image type
        }
      }
    ];
    
    const result = await model.generateContent({ contents: [{ parts }] });
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);
    throw new Error('Failed to analyze image with AI');
  }
}

module.exports = {
  generateTextResponse,
  analyzeImageAndGenerateResponse
};