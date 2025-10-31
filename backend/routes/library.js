const express = require('express');
const router = express.Router();
const topicDocumentController = require('../controllers/topicDocumentController');
const auth = require('../middlewares/auth');

// Debug middleware
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Get user's library (consolidated summaries of watched topics)
router.get('/user/:username', auth, topicDocumentController.getUserLibrary);

// Get detailed view of a specific topic in the library by ID
router.get('/topic/:id', auth, topicDocumentController.getTopicDocumentById);

// Generate/update consolidated summary for a topic
router.post('/summarize/:topic', auth, topicDocumentController.generateConsolidatedSummary);

// Get all topic documents for the authenticated user
router.get('/', auth, topicDocumentController.getAllTopicDocuments);

module.exports = router;
