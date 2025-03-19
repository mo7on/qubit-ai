const { GoogleGenerativeAI } = require('@google/generative-ai');
const DatabaseService = require('./database.service');

class ArticleService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Generate IT Support article topics
   * @returns {Promise<Array>} - List of IT Support topics
   */
  async generateTopics() {
    try {
      const prompt = `
        Generate 5 trending and relevant IT Support topics that would be valuable for IT professionals and users.
        Each topic should be specific enough to create a detailed article about.
        
        Format your response as a JSON array of strings, with each string being a topic title.
        Example: ["Troubleshooting Windows 11 Network Issues", "Best Practices for Secure Password Management"]
      `;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract JSON array from response
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse topics from AI response');
    } catch (error) {
      console.error('Error generating article topics:', error);
      // Fallback topics if generation fails
      return [
        "Common Windows 10 Troubleshooting Steps",
        "How to Secure Your Home Network"
      ];
    }
  }

  /**
   * Generate an article for a given topic
   * @param {string} topic - Article topic
   * @returns {Promise<Object>} - Generated article
   */
  async generateArticle(topic) {
    try {
      const prompt = `
        Write a comprehensive, well-structured article about "${topic}" for an IT Support knowledge base.
        
        The article should:
        - Be informative and technically accurate
        - Include practical steps and solutions
        - Be organized with clear headings and subheadings
        - Include best practices and common pitfalls
        - Be around 800-1000 words
        
        Format your response as a JSON object with the following structure:
        {
          "title": "The article title",
          "content": "The full article content with markdown formatting",
          "summary": "A brief 2-3 sentence summary of the article",
          "tags": ["tag1", "tag2", "tag3"]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract JSON object from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const articleData = JSON.parse(jsonMatch[0]);
        
        // Clean and format the content
        articleData.content = this.cleanArticleContent(articleData.content);
        
        return {
          ...articleData,
          created_at: new Date(),
          updated_at: new Date()
        };
      }
      
      throw new Error('Failed to parse article from AI response');
    } catch (error) {
      console.error(`Error generating article for topic "${topic}":`, error);
      // Return a basic error article
      return {
        title: topic,
        content: "We apologize, but we encountered an issue generating this article. Please check back later.",
        summary: "Article generation failed.",
        tags: ["IT Support"],
        created_at: new Date(),
        updated_at: new Date()
      };
    }
  }

  /**
   * Clean and format article content
   * @param {string} content - Raw article content
   * @returns {string} - Cleaned article content
   */
  cleanArticleContent(content) {
    // Remove any code block markers that might be in the response
    let cleaned = content.replace(/```json|```/g, '');
    
    // Ensure proper markdown heading formatting
    cleaned = cleaned.replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2');
    
    // Add line breaks after headings
    cleaned = cleaned.replace(/^(#{1,6} .+)$/gm, '$1\n');
    
    return cleaned;
  }

  /**
   * Generate and save multiple articles
   * @param {number} count - Number of articles to generate
   * @returns {Promise<Array>} - Generated articles
   */
  async generateAndSaveArticles(count = 2) {
    try {
      // Generate topics
      const topics = await this.generateTopics();
      const selectedTopics = topics.slice(0, count);
      
      const articles = [];
      
      // Generate articles for each selected topic
      for (const topic of selectedTopics) {
        const article = await this.generateArticle(topic);
        
        // Save article to database
        const savedArticle = await DatabaseService.article.create(article);
        articles.push(savedArticle);
      }
      
      return articles;
    } catch (error) {
      console.error('Error generating and saving articles:', error);
      throw error;
    }
  }
}

module.exports = new ArticleService();