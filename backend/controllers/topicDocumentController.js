const TopicDocument = require('../models/TopicDocument');
const { generateDetailedSummary } = require('../services/geminiService');
const User = require('../models/User');

// Track video watch for topic documentation
exports.trackVideoWatch = async (req, res) => {
  try {
    const { videoId, videoTitle, topic, keywords } = req.body;
    const userId = req.user._id;

    if (!videoId || !topic) {
      return res.status(400).json({ error: 'Video ID and topic are required' });
    }

    const normalizedTopic = topic.toLowerCase().trim();

    // Find or create topic document
    let topicDoc = await TopicDocument.findOne({ userId, normalizedTopic });

    if (!topicDoc) {
      topicDoc = new TopicDocument({
        userId,
        topic: topic.trim(),
        normalizedTopic,
        videosSummaries: [],
        totalVideosWatched: 0,
        consolidatedSummary: {
          mainConcepts: [],
          detailedPoints: [],
          relatedTopics: []
        }
      });
    }

    // Add new video summary
    topicDoc.videosSummaries.unshift({
      videoId,
      videoTitle: videoTitle || 'Untitled Video',
      keywords: keywords || [],
      keyPoints: [],
      watchedAt: new Date()
    });

    // Keep only last 3 videos
    topicDoc.videosSummaries = topicDoc.videosSummaries.slice(0, 3);
    topicDoc.totalVideosWatched += 1;
    topicDoc.lastAccessed = new Date();

    await topicDoc.save();

    res.json({ 
      success: true, 
      message: 'Video tracked successfully',
      topicDocument: topicDoc 
    });
  } catch (error) {
    console.error('Error tracking video watch:', error);
    res.status(500).json({ error: 'Failed to track video watch' });
  }
};

// Generate consolidated summary for a topic
exports.generateConsolidatedSummary = async (req, res) => {
  try {
    const { topic } = req.params;
    const userId = req.user._id;
    const normalizedTopic = topic.toLowerCase().trim();

    const topicDoc = await TopicDocument.findOne({ userId, normalizedTopic });

    if (!topicDoc) {
      return res.status(404).json({ error: 'Topic document not found' });
    }

    if (topicDoc.videosSummaries.length === 0) {
      return res.status(400).json({ error: 'No videos found for this topic' });
    }

    // Gather all keywords from last 3 videos
    const allKeywords = topicDoc.videosSummaries.reduce((acc, video) => {
      return [...acc, ...(video.keywords || [])];
    }, []);

    // Generate comprehensive summary using Gemini
    const prompt = `You are an expert educator creating a comprehensive learning document.

Topic: ${topicDoc.topic}

I have watched ${topicDoc.videosSummaries.length} videos on this topic. Here are the keywords and information from these videos:

${topicDoc.videosSummaries.map((video, index) => `
Video ${index + 1}: ${video.videoTitle}
Keywords: ${video.keywords.join(', ')}
`).join('\n')}

All Keywords Combined: ${allKeywords.join(', ')}

Please create an EXTENSIVE and COMPREHENSIVE learning document with the following structure:

1. MAIN CONCEPTS (5-8 major concepts)
   - List the core fundamental concepts of ${topicDoc.topic}
   
2. DETAILED EXPLANATION (20-30 bullet points)
   - Provide thorough explanations moving from basic to advanced
   - Each point should be substantial and educational
   - Organize points to build knowledge progressively
   - Cover: fundamentals, key principles, important techniques, practical applications, best practices, common challenges, and advanced topics
   - Make it comprehensive enough for someone to get a solid understanding of the topic

3. RELATED TOPICS (5-10 related areas)
   - List related topics for further exploration

Format your response as JSON:
{
  "mainConcepts": ["concept1", "concept2", ...],
  "detailedPoints": ["point1", "point2", ...],
  "relatedTopics": ["topic1", "topic2", ...]
}

Make this a THOROUGH educational resource that combines insights from all the videos watched.`;

    const summaryData = await generateDetailedSummary(prompt);
    
    // Update topic document with consolidated summary
    topicDoc.consolidatedSummary = {
      mainConcepts: summaryData.mainConcepts || [],
      detailedPoints: summaryData.detailedPoints || [],
      relatedTopics: summaryData.relatedTopics || [],
      lastUpdated: new Date()
    };

    await topicDoc.save();

    res.json({
      success: true,
      topicDocument: topicDoc
    });
  } catch (error) {
    console.error('Error generating consolidated summary:', error);
    res.status(500).json({ error: 'Failed to generate consolidated summary' });
  }
};

// Get user's library (consolidated summaries of watched topics)
exports.getUserLibrary = async (req, res) => {
  try {
    const { username } = req.params;
    console.log(`Looking up user with username: ${username}`);
    
    // Find user by username
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log(`User ${username} not found`);
      return res.status(200).json({ topicDocuments: [] });
    }

    // Get all topic documents for the user, sorted by last accessed
    const topicDocs = await TopicDocument.find({ userId: user._id })
      .sort({ lastAccessed: -1 });

    // Format the response to include only necessary library information
    const library = topicDocs.map(doc => ({
      id: doc._id,
      topic: doc.topic,
      lastAccessed: doc.lastAccessed,
      totalVideos: doc.totalVideosWatched,
      summary: doc.consolidatedSummary?.mainConcepts?.slice(0, 3) || [],
      lastVideo: doc.videosSummaries[0]?.videoTitle || 'No videos watched'
    }));

    res.json({ topicDocuments: library });
  } catch (error) {
    console.error('Error in getUserLibrary:', error);
    res.status(500).json({ 
      error: 'Failed to fetch library',
      details: error.message 
    });
  }
};

// Get all topic documents for user
exports.getAllTopicDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username } = req.body;

    // If username is provided, find by username instead of user ID
    let query = {};
    if (username) {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      query.userId = user._id;
    } else {
      query.userId = userId;
    }

    const topicDocs = await TopicDocument.find(query)
      .sort({ lastAccessed: -1 })
      .select('-__v');

    res.json({
      success: true,
      topicDocuments: topicDocs
    });
  } catch (error) {
    console.error('Error getting topic documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get topic documents',
      details: error.message
    });
  }
};

// Get single topic document
exports.getTopicDocument = async (req, res) => {
  try {
    const { topic } = req.params;
    const userId = req.user._id;
    const normalizedTopic = topic.toLowerCase().trim();

    const topicDoc = await TopicDocument.findOne({ userId, normalizedTopic });

    if (!topicDoc) {
      return res.status(404).json({
        success: false,
        error: 'Topic document not found'
      });
    }

    // Update last accessed
    topicDoc.lastAccessed = new Date();
    await topicDoc.save();

    res.json({
      success: true,
      topicDocument: topicDoc
    });
  } catch (error) {
    console.error('Error fetching topic document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch topic document',
      details: error.message
    });
  }
};

// Get single topic document by ID
exports.getTopicDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const topicDoc = await TopicDocument.findOne({
      _id: id,
      userId
    });

    if (!topicDoc) {
      return res.status(404).json({
        success: false,
        error: 'Topic document not found'
      });
    }

    res.json({
      success: true,
      topicDocument: topicDoc
    });
  } catch (error) {
    console.error('Error getting topic document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get topic document',
      details: error.message
    });
  }
};

// Delete topic document
exports.deleteTopicDocument = async (req, res) => {
  try {
    const { topic } = req.params;
    const userId = req.user._id;
    const normalizedTopic = topic.toLowerCase().trim();

    const result = await TopicDocument.findOneAndDelete({ userId, normalizedTopic });

    if (!result) {
      return res.status(404).json({ error: 'Topic document not found' });
    }

    res.json({
      success: true,
      message: 'Topic document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting topic document:', error);
    res.status(500).json({ error: 'Failed to delete topic document' });
  }
};
