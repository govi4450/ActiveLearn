
const express = require('express');
const router = express.Router();

/**
 * POST /api/articles/:videoId
 * Simplified endpoint that returns fallback articles
 * The frontend now handles article fetching directly via Google API
 */
router.post('/articles/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { videoTitle } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    if (!videoTitle) {
      return res.status(400).json({ error: 'Video title is required' });
    }

    // Return fallback articles since frontend handles the real fetching
    const topic = videoTitle.split(' ').slice(0, 3).join(' ');
    
    const fallbackArticles = [
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

    res.json({
      success: true,
      videoId,
      articles: fallbackArticles,
      count: fallbackArticles.length
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ 
      error: 'Failed to fetch articles',
      message: error.message 
    });
  }
});

/**
 * POST /api/articles/clear-cache
 * Legacy endpoint - now just returns success
 */
router.post('/articles/clear-cache', (req, res) => {
  res.json({ success: true, message: 'Cache cleared' });
});

module.exports = router;
