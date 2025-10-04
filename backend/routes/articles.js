const express = require('express');
const router = express.Router();
const ArticleService = require('../services/articleService');
const TranscriptService = require('../services/transcriptService');
const GeminiService = require('../services/geminiService');

/**
 * POST /api/articles/clear-cache
 * Clear the article cache
 */
router.post('/articles/clear-cache', (req, res) => {
  try {
    ArticleService.clearCache();
    res.json({ success: true, message: 'Cache cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

/**
 * POST /api/articles/:videoId
 * Get articles for a specific video based on its content
 */
router.post('/articles/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { videoTitle, summary, transcript } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    if (!videoTitle) {
      return res.status(400).json({ error: 'Video title is required' });
    }

    console.log(`📰 Fetching articles for video: ${videoId}`);
    console.log(`📝 Title: ${videoTitle}`);

    // Get articles directly from video title
    // Summary and transcript are optional and will be used if provided
    const articles = await ArticleService.getArticlesForVideo(
      videoId,
      videoTitle,
      summary || '',
      transcript || ''
    );

    res.json({
      success: true,
      videoId,
      articles,
      count: articles.length
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
 * POST /api/articles/batch
 * Get articles for multiple videos at once
 */
router.post('/articles/batch', async (req, res) => {
  try {
    const { videos } = req.body;

    if (!videos || !Array.isArray(videos)) {
      return res.status(400).json({ error: 'Videos array is required' });
    }

    console.log(`📰 Fetching articles for ${videos.length} videos`);

    // Clear cache for new batch
    ArticleService.clearCache();

    const results = {};
    const errors = {};

    // Process videos sequentially to avoid rate limiting
    for (const video of videos) {
      try {
        const { videoId, videoTitle, summary, transcript } = video;

        if (!videoId || !videoTitle) {
          errors[videoId || 'unknown'] = 'Missing videoId or videoTitle';
          continue;
        }

        const articles = await ArticleService.getArticlesForVideo(
          videoId,
          videoTitle,
          summary || '',
          transcript || ''
        );

        results[videoId] = articles;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error fetching articles for video ${video.videoId}:`, error);
        errors[video.videoId] = error.message;
      }
    }

    res.json({
      success: true,
      results,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      totalProcessed: Object.keys(results).length
    });

  } catch (error) {
    console.error('Error in batch article fetch:', error);
    res.status(500).json({ 
      error: 'Failed to fetch articles',
      message: error.message 
    });
  }
});

module.exports = router;
