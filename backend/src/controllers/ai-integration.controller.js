const AIIntegrationService = require('../services/ai-integration.service');

/**
 * Controller for AI integration endpoints
 */
exports.generateResponseWithSources = async (req, res) => {
  try {
    const { query, options } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }
    
    console.log(`Processing query: ${query}`);
    
    // Get response with sources
    const result = await AIIntegrationService.getResponseWithSources(query, options);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Determine appropriate status code
    let statusCode = 500;
    let errorMessage = 'Error generating AI response';
    
    if (error.message.includes('quota')) {
      statusCode = 429;
      errorMessage = 'API quota exceeded. Please try again later.';
    } else if (error.message.includes('sources')) {
      statusCode = 502;
      errorMessage = 'Error fetching sources. Please try again later.';
    }
    
    res.status(statusCode).json({ 
      message: errorMessage, 
      error: error.message 
    });
  }
};

exports.getSources = async (req, res) => {
  try {
    const { query, options } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }
    
    // Get sources only
    const sources = await AIIntegrationService.getSources(query, options);
    
    res.status(200).json({ query, sources });
  } catch (error) {
    console.error('Error fetching sources:', error);
    res.status(500).json({ 
      message: 'Error fetching sources', 
      error: error.message 
    });
  }
};

/**
 * معالجة رسالة المستخدم وإرجاع رد مع مصادر
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الاستجابة
 */
exports.processUserMessage = async (req, res) => {
  try {
    const { message, options } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        status: 'error',
        message: 'الرسالة مطلوبة' 
      });
    }
    
    console.log(`معالجة رسالة المستخدم: ${message}`);
    
    // الحصول على المصادر من Tavily AI
    const sources = await AIIntegrationService.getSources(message, options?.tavily);
    
    if (!sources || sources.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'لم يتم العثور على مصادر ذات صلة. يرجى إعادة صياغة السؤال.'
      });
    }
    
    // إنشاء رد باستخدام Gemini AI والمصادر
    const response = await AIIntegrationService.generateResponse(message, sources, options?.gemini);
    
    // إرجاع النتيجة المجمعة
    res.status(200).json({
      status: 'success',
      data: {
        query: message,
        response: response,
        sources: sources,
        metadata: {
          timestamp: new Date().toISOString(),
          sourceCount: sources.length
        }
      }
    });
  } catch (error) {
    console.error('خطأ في معالجة رسالة المستخدم:', error);
    
    // تحديد رمز الحالة المناسب
    let statusCode = 500;
    let errorMessage = 'حدث خطأ أثناء معالجة الرسالة';
    
    if (error.message.includes('quota')) {
      statusCode = 429;
      errorMessage = 'تم تجاوز حصة API. يرجى المحاولة مرة أخرى لاحقًا.';
    } else if (error.message.includes('sources')) {
      statusCode = 502;
      errorMessage = 'خطأ في جلب المصادر. يرجى المحاولة مرة أخرى لاحقًا.';
    }
    
    res.status(statusCode).json({ 
      status: 'error',
      message: errorMessage
    });
  }
};