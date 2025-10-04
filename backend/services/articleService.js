const axios = require('axios');

const TRUSTED_SOURCES = [
  "wikipedia.org", "khanacademy.org", "britannica.com", "edu.gov",
  "academia.edu", "scholar.google.com", "coursera.org", "edx.org",
  "mit.edu", "harvard.edu", "stanford.edu", "tutorialspoint.com",
  "geeksforgeeks.org", "towardsdatascience.com", "medium.com",
  "arxiv.org", "ted.com", "smithsonianmag.com", "nature.com",
  "sciencedirect.com", "jstor.org", "plos.org", "springer.com"
];

class ArticleService {
  static apiKeys = [
    process.env.GOOGLE_SEARCH_API_KEY_1,
    process.env.GOOGLE_SEARCH_API_KEY_2
  ];
  static currentKeyIndex = 0;
  static searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  static usedArticleUrls = new Set(); // Track used URLs globally to prevent repetition
  static currentSessionId = null; // Track current search session

  /**
   * Get the next available API key (round-robin)
   */
  static getNextApiKey() {
    const key = this.apiKeys[this.currentKeyIndex];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    return key;
  }

  /**
   * Extract key topics from summary
   */
  static extractKeyTopics(summary) {
    if (!summary) return [];
    
    // If summary is an array of bullet points, join them
    const summaryText = Array.isArray(summary) ? summary.join(' ') : summary;
    
    // Remove common words and extract meaningful terms
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
    
    const words = summaryText.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));
    
    // Get word frequency
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    // Sort by frequency and take top 5
    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
    
    return topWords;
  }

  /**
   * Generate search query from video content
   */
  static generateSearchQuery(videoTitle, summary, transcript) {
    // Extract key topics from summary
    const keyTopics = this.extractKeyTopics(summary);
    
    if (keyTopics.length > 0) {
      // Use video title first 4 words + key topics from summary
      const titleWords = videoTitle.split(' ').slice(0, 4).join(' ');
      const topicWords = keyTopics.slice(0, 3).join(' ');
      return `${titleWords} ${topicWords}`.trim();
    } else {
      // No summary available, use the full video title for uniqueness
      // This ensures each video gets different articles
      return videoTitle.trim();
    }
  }

  /**
   * Fetch articles from Google Custom Search API
   */
  static async fetchArticlesFromGoogle(searchQuery, videoId, numResults = 15) {
    const apiKey = this.getNextApiKey();
    
    if (!apiKey || !this.searchEngineId) {
      throw new Error('Google Search API credentials not configured');
    }

    try {
      console.log(`🔍 Searching articles for: "${searchQuery}" (Video: ${videoId})`);
      
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: apiKey,
          cx: this.searchEngineId,
          q: searchQuery,
          num: numResults > 10 ? 10 : numResults, // Google API max is 10 per request
          safe: 'medium',
          fields: 'items(title,link,snippet,displayLink,pagemap/metatags)'
        },
        timeout: 10000
      });

      if (!response.data.items || response.data.items.length === 0) {
        console.log('⚠️ No results from Google Search API, trying fallback...');
        return [];
      }

      console.log(`✅ Found ${response.data.items.length} results from Google`);
      return response.data.items;
    } catch (error) {
      console.error('Google Search API error:', error.message);
      
      // If first key fails, try second key
      if (this.apiKeys.length > 1) {
        try {
          const fallbackKey = this.getNextApiKey();
          console.log('🔄 Retrying with alternate API key...');
          
          const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
              key: fallbackKey,
              cx: this.searchEngineId,
              q: searchQuery,
              num: numResults > 10 ? 10 : numResults,
              safe: 'medium',
              fields: 'items(title,link,snippet,displayLink,pagemap/metatags)'
            },
            timeout: 10000
          });

          if (response.data.items) {
            console.log(`✅ Fallback successful: ${response.data.items.length} results`);
            return response.data.items;
          }
        } catch (fallbackError) {
          console.error('Fallback API key also failed:', fallbackError.message);
        }
      }
      
      return [];
    }
  }

  /**
   * Filter and rank articles by relevance and trustworthiness
   */
  static filterAndRankArticles(items, searchQuery, videoId) {
    // Use the global used URLs set for deduplication

    const queryTerms = searchQuery.toLowerCase().split(' ').filter(t => t.length > 3);
    
    const scoredArticles = items
      .filter(item => {
        const domain = item.displayLink.toLowerCase();
        const url = item.link.toLowerCase();
        const title = item.title.toLowerCase();
        
        // Filter out already used URLs
        if (this.usedArticleUrls.has(item.link)) {
          console.log(`⏭️  Skipping duplicate: ${item.title}`);
          return false;
        }
        
        // Must be from trusted source
        const isTrusted = TRUSTED_SOURCES.some(source => domain.includes(source));
        
        // Avoid video results and YouTube
        const isNotVideo = !title.includes('video') && 
                          !title.includes('youtube') && 
                          !url.includes('youtube.com') &&
                          !url.includes('watch?v=');
        
        // Avoid course landing pages (we want direct articles)
        const isDirectArticle = !url.includes('/courses/') || 
                               url.includes('/lecture') || 
                               url.includes('/article') ||
                               url.includes('/wiki/');
        
        return isTrusted && isNotVideo && isDirectArticle;
      })
      .map(item => {
        const title = item.title.toLowerCase();
        const snippet = item.snippet.toLowerCase();
        const domain = item.displayLink.toLowerCase();
        
        // Calculate relevance score
        let score = 0;
        
        // Score based on query term matches
        queryTerms.forEach(term => {
          if (title.includes(term)) score += 3;
          if (snippet.includes(term)) score += 1;
        });
        
        // Bonus for high-quality sources
        if (domain.includes('wikipedia.org')) score += 2;
        if (domain.includes('harvard.edu') || domain.includes('mit.edu') || domain.includes('stanford.edu')) score += 3;
        if (domain.includes('britannica.com')) score += 2;
        if (domain.includes('arxiv.org') || domain.includes('scholar.google')) score += 2;
        
        // Penalty for generic course pages
        if (item.link.includes('coursera.org/search') || item.link.includes('edx.org/search')) score -= 5;
        
        return {
          ...item,
          score
        };
      })
      .filter(item => item.score > 0) // Only keep relevant articles
      .sort((a, b) => b.score - a.score); // Sort by relevance
    
    return scoredArticles;
  }

  /**
   * Format articles for frontend
   */
  static formatArticles(items) {
    return items.map(item => {
      // Try to extract date from metadata
      let date = new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      if (item.pagemap && item.pagemap.metatags && item.pagemap.metatags[0]) {
        const meta = item.pagemap.metatags[0];
        const publishDate = meta['article:published_time'] || 
                          meta['datePublished'] || 
                          meta['date'];
        if (publishDate) {
          try {
            date = new Date(publishDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            });
          } catch (e) {
            // Keep default date if parsing fails
          }
        }
      }
      
      return {
        source: item.displayLink,
        title: item.title,
        date: date,
        snippet: item.snippet,
        url: item.link
      };
    });
  }

  /**
   * Generate fallback articles when API fails
   */
  static generateFallbackArticles(searchQuery) {
    const topic = searchQuery.split(' ').slice(0, 3).join(' ');
    
    return [
      {
        source: 'wikipedia.org',
        title: `${topic} - Wikipedia`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        snippet: `Comprehensive information about ${topic} and related concepts.`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(topic.replace(/\s+/g, '_'))}`
      },
      {
        source: 'britannica.com',
        title: `${topic} | Britannica`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        snippet: `Detailed encyclopedia entry about ${topic}.`,
        url: `https://www.britannica.com/search?query=${encodeURIComponent(topic)}`
      },
      {
        source: 'khanacademy.org',
        title: `Learn ${topic} - Khan Academy`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        snippet: `Interactive learning materials and exercises related to ${topic}.`,
        url: `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(topic)}`
      }
    ];
  }

  /**
   * Main method to get articles for a video
   */
  static async getArticlesForVideo(videoId, videoTitle, summary, transcript) {
    try {
      // Generate search query from video content
      const searchQuery = this.generateSearchQuery(videoTitle, summary, transcript);
      console.log(`📝 Generated search query: "${searchQuery}"`);
      
      // Fetch articles from Google
      const searchResults = await this.fetchArticlesFromGoogle(searchQuery, videoId, 15);
      
      if (searchResults.length === 0) {
        console.log('⚠️ No search results, using fallback articles');
        return this.generateFallbackArticles(searchQuery);
      }
      
      // Filter and rank articles
      const rankedArticles = this.filterAndRankArticles(searchResults, searchQuery, videoId);
      
      if (rankedArticles.length === 0) {
        console.log('⚠️ No articles passed filtering, using fallback');
        return this.generateFallbackArticles(searchQuery);
      }
      
      // Take top 3 unique articles
      const topArticles = rankedArticles.slice(0, 3);
      
      // Mark these URLs as used globally
      topArticles.forEach(article => {
        this.usedArticleUrls.add(article.link);
        console.log(`✅ Using article: ${article.title}`);
      });
      
      // Format for frontend
      const formattedArticles = this.formatArticles(topArticles);
      
      console.log(`✅ Returning ${formattedArticles.length} unique articles for video ${videoId}`);
      return formattedArticles;
      
    } catch (error) {
      console.error('Error getting articles:', error);
      // Return fallback articles on error
      const fallbackQuery = videoTitle.split(' ').slice(0, 3).join(' ');
      return this.generateFallbackArticles(fallbackQuery);
    }
  }

  /**
   * Clear used articles cache (call this when starting a new search session)
   */
  static clearCache() {
    this.usedArticleUrls.clear();
    this.currentSessionId = null;
    console.log('🧹 Article cache cleared');
  }

  /**
   * Start a new search session (clears cache)
   */
  static startNewSession() {
    this.clearCache();
    this.currentSessionId = `session_${Date.now()}`;
    console.log(`🆕 Started new article session: ${this.currentSessionId}`);
  }
}

module.exports = ArticleService;
