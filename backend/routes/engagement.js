const express = require('express');
const router = express.Router();
const EngagementSession = require('../models/EngagementSession');
const User = require('../models/User');
const engagementService = require('../services/engagementService');

// Check if Lokdin service is running
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await engagementService.checkHealth();
    res.json({ 
      lokdinAvailable: isHealthy,
      message: isHealthy ? 'Lokdin service is running' : 'Lokdin service is not available'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check service health' });
  }
});

// Start engagement monitoring
router.post('/start', async (req, res) => {
  try {
    const { username, videoId, videoTitle } = req.body;

    if (!username || !videoId) {
      return res.status(400).json({ error: 'Username and videoId are required' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if there's already an active session for this user
    const existingSession = await EngagementSession.findOne({
      userId: user._id,
      isActive: true
    });

    if (existingSession) {
      return res.status(400).json({ 
        error: 'Active session already exists',
        sessionId: existingSession._id
      });
    }

    // Start Lokdin monitoring
    const sessionName = `${username} - ${videoTitle || videoId}`;
    await engagementService.startMonitoring(user._id.toString(), sessionName);

    // Create new engagement session in database
    const session = new EngagementSession({
      userId: user._id,
      videoId,
      videoTitle: videoTitle || 'Unknown',
      startTime: new Date(),
      isActive: true,
      metrics: []
    });

    await session.save();

    res.json({
      success: true,
      sessionId: session._id,
      message: 'Engagement monitoring started',
      videoFeedUrl: engagementService.getVideoFeedUrl()
    });

  } catch (error) {
    console.error('Error starting engagement monitoring:', error);
    res.status(500).json({ error: error.message || 'Failed to start monitoring' });
  }
});

// Stop engagement monitoring
router.post('/stop/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Find the session
    const session = await EngagementSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.isActive) {
      return res.status(400).json({ error: 'Session is already stopped' });
    }

    // Stop Lokdin monitoring
    const summary = await engagementService.stopMonitoring();

    // Update session
    session.endTime = new Date();
    session.duration = (session.endTime - session.startTime) / 1000; // in seconds
    session.isActive = false;
    
    // Calculate summary
    session.calculateSummary();
    
    await session.save();

    res.json({
      success: true,
      sessionId: session._id,
      duration: session.duration,
      averageEngagement: session.averageEngagement,
      summary: session.summary,
      lokdinSummary: summary
    });

  } catch (error) {
    console.error('Error stopping engagement monitoring:', error);
    res.status(500).json({ error: error.message || 'Failed to stop monitoring' });
  }
});

// Collect metrics (called periodically by frontend)
router.post('/collect/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Find the session
    const session = await EngagementSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.isActive) {
      return res.status(400).json({ error: 'Session is not active' });
    }

    // Get current metrics from Lokdin
    const metrics = await engagementService.getCurrentMetrics();
    
    if (metrics) {
      // Add metrics to session
      session.metrics.push({
        timestamp: new Date(),
        engagement_score: metrics.engagement_score,
        emotion: metrics.emotion,
        head_pose: metrics.head_pose,
        eye_contact_duration: metrics.eye_contact_duration,
        stability: metrics.stability
      });

      // Keep only last 1000 metrics to prevent DB bloat
      if (session.metrics.length > 1000) {
        session.metrics = session.metrics.slice(-1000);
      }

      await session.save();

      res.json({
        success: true,
        currentMetrics: metrics,
        totalMetricsCollected: session.metrics.length
      });
    } else {
      res.json({
        success: false,
        message: 'No metrics available from Lokdin'
      });
    }

  } catch (error) {
    console.error('Error collecting metrics:', error);
    res.status(500).json({ error: error.message || 'Failed to collect metrics' });
  }
});

// Get session details
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await EngagementSession.findById(sessionId)
      .populate('userId', 'username email');

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);

  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Get user's engagement history
router.get('/history/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { limit = 10 } = req.query;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get engagement sessions
    const sessions = await EngagementSession.find({ userId: user._id })
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .select('-metrics'); // Exclude detailed metrics for list view

    res.json(sessions);

  } catch (error) {
    console.error('Error fetching engagement history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get video feed URL
router.get('/video-feed-url', (req, res) => {
  res.json({ 
    url: engagementService.getVideoFeedUrl()
  });
});

module.exports = router;
