const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  userAnswer: String,
  isCorrect: Boolean,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoId: {
    type: String,
    required: true
  },
  videoTitle: {
    type: String,
    default: ''
  },
  videoThumbnail: {
    type: String,
    default: ''
  },
  responses: [responseSchema],
  score: {
    correct: Number,
    total: Number,
    percentage: Number
  },
  completed: {
    type: Boolean,
    default: false
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

progressSchema.index({ userId: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);