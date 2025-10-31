require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const connectDB = require('./config/database');

// Route imports - make sure these use express.Router()
const authRoutes = require('./routes/auth');
const summaryRoutes = require('./routes/summaries');
const questionRoutes = require('./routes/questions');
const articleRoutes = require('./routes/articles');
const dashboardRoutes = require('./routes/dashboard');
const bookmarkRoutes = require('./routes/bookmarks');
const noteRoutes = require('./routes/notes');
const goalRoutes = require('./routes/goals');
const achievementRoutes = require('./routes/achievements');
const mindmapRoutes = require('./routes/mindmaps');
const topicDocumentRoutes = require('./routes/topicDocuments');
const libraryRoutes = require('./routes/library');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();                                                        

// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../reactcode/reactcode1/build')));

// Routes - Use Express Router
app.use('/api/auth', authRoutes);
app.use('/api', summaryRoutes);
app.use('/api', questionRoutes);
app.use('/api', articleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/mindmaps', mindmapRoutes);
app.use('/api/topic-documents', topicDocumentRoutes);
app.use('/api/library', libraryRoutes);

// YouTube API endpoints
app.get('/api/youtube/search', async (req, res) => {
  try {
    const { q: query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    console.log('Searching YouTube for:', query);
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        type: 'video',
        q: query,
        maxResults: 5,
        key: process.env.YOUTUBE_API_KEY
      }
    });
    
    console.log('YouTube search successful, items found:', response.data?.items?.length || 0);
    res.json(response.data);
  } catch (error) {
    console.error('YouTube API Search Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch videos',
      details: error.response?.data || error.message
    });
  }
});

// Get video by ID
app.get('/api/youtube/videos/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    console.log('Fetching YouTube video:', videoId);
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet,contentDetails',
        id: videoId,
        key: process.env.YOUTUBE_API_KEY
      }
    });
    
    console.log('YouTube video fetch successful');
    res.json(response.data);
  } catch (error) {
    console.error('YouTube Video Fetch Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch video',
      details: error.response?.data || error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});
