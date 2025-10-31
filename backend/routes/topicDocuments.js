const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const topicDocumentController = require('../controllers/topicDocumentController');

// Track video watch for topic documentation
router.post('/track', auth, topicDocumentController.trackVideoWatch);

// Generate consolidated summary for a topic
router.post('/generate/:topic', auth, topicDocumentController.generateConsolidatedSummary);

// Get all topic documents for user (used by library)
router.post('/', auth, topicDocumentController.getAllTopicDocuments);

// Get user's library (consolidated view of all topics)
router.get('/user/:username', auth, topicDocumentController.getUserLibrary);

// Get single topic document
router.get('/:id', auth, topicDocumentController.getTopicDocument);

// Delete topic document
router.delete('/:id', auth, topicDocumentController.deleteTopicDocument);

module.exports = router;
