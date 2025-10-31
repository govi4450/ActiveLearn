const mongoose = require('mongoose');

const videoSummarySchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true
  },
  videoTitle: String,
  keywords: [String],
  keyPoints: [String],
  watchedAt: {
    type: Date,
    default: Date.now
  }
});

const topicDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  normalizedTopic: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  videosSummaries: [videoSummarySchema],
  consolidatedSummary: {
    mainConcepts: [String],
    detailedPoints: [String],
    relatedTopics: [String],
    lastUpdated: Date
  },
  totalVideosWatched: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficient querying
topicDocumentSchema.index({ userId: 1, normalizedTopic: 1 }, { unique: true });
topicDocumentSchema.index({ userId: 1, lastAccessed: -1 });

module.exports = mongoose.model('TopicDocument', topicDocumentSchema);
