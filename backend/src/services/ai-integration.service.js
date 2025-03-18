const { GoogleGenerativeAI } = require('@google/generative-ai');
const { TavilySearchAPIRetriever } = require('tavily-js');
const tavilyService = require('./tavily.service');

// تهيئة Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });

// تهيئة Tavily AI
const tavilyRetriever = new TavilySearchAPIRetriever({
  apiKey: process.env.TAVILY_API_KEY,
  maxResults: 5
});

/**
 * خدمة تكامل الذكاء الاصطناعي
 */
class AIIntegrationService {
  /**
   * الحصول على مصادر ذات صلة من Tavily AI
   * @param {string} query - استعلام المستخدم
   * @param {Object} options - خيارات البحث
   * @returns {Promise<Array>} - مصفوفة من المصادر
   */
  static async getSources(query, options = {}) {
    try {
      console.log(`جلب المصادر للاستعلام: ${query}`);
      
      const searchOptions = {
        searchDepth: options?.searchDepth || "advanced",
        maxResults: options?.maxResults || 5,
        includeDomains: options?.includeDomains || [],
        excludeDomains: options?.excludeDomains || []
      };
      
      const results = await tavilyService.search(query, searchOptions);
      
      // Format the sources
      return results.results.map(result => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score,
        published_date: result.published_date || null
      }));
    } catch (error) {
      console.error('خطأ في جلب المصادر من Tavily:', error);
      throw new Error(`فشل في جلب المصادر: ${error.message}`);
    }
  }

  /**
   * إنشاء رد باستخدام Gemini AI مع المصادر
   * @param {string} query - استعلام المستخدم
   * @param {Array} sources - المصادر من Tavily
   * @param {Object} options - خيارات التوليد
   * @returns {Promise<string>} - الرد المولد
   */
  static async generateResponse(query, sources, options = {}) {
    try {
      console.log(`توليد رد للاستعلام: ${query} مع ${sources.length} مصادر`);
      
      // تنسيق المصادر للإدخال
      const sourcesText = sources.map((source, index) => 
        `المصدر ${index + 1}: ${source.title}\nالرابط: ${source.url}\nالمحتوى: ${source.content}\n`
      ).join('\n');
      
      // إنشاء إدخال مع الاستعلام والمصادر
      const prompt = `
        أنت مساعد بحث ذكي اصطناعي مفيد يقدم معلومات دقيقة وواقعية.
        
        أجب على الاستعلام التالي بناءً على هذه المصادر:
        
        الاستعلام: ${query}
        
        المصادر:
        ${sourcesText}
        
        تعليمات:
        1. قدم إجابة شاملة تجمع المعلومات من المصادر.
        2. قم بتضمين اقتباسات ذات صلة للمصادر في ردك باستخدام ترميز [المصدر X].
        3. إذا كانت المصادر لا تحتوي على معلومات كافية للإجابة على الاستعلام، يرجى ذكر ذلك بوضوح.
        4. قم بتنسيق ردك بلغة Markdown لقراءة أفضل.
        5. إذا كان ذلك مناسبًا، قم بهيكلة ردك باستخدام العناوين أو النقاط أو القوائم المرقمة.
        6. كن موجزًا ولكن شاملًا.
        7. ركز فقط على المعلومات من المصادر المقدمة.
      `;
      
      // توليد الرد باستخدام Gemini
      const result = await geminiModel.generateContent(prompt);
      const response = result.response;
      
      return response.text();
    } catch (error) {
      console.error('خطأ في توليد الرد باستخدام Gemini:', error);
      
      // التعامل مع أنواع الأخطاء المحددة
      if (error.message.includes('quota')) {
        throw new Error('تم تجاوز حصة API. يرجى المحاولة مرة أخرى لاحقًا.');
      }
      
      throw new Error(`فشل في توليد الرد: ${error.message}`);
    }
  }
}

module.exports = AIIntegrationService;