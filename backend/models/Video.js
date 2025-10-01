const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true
  },
  title: String,
  channel: String,
  duration: Number,
  transcript: String,
  summary: [{
    text: String,
    timestamp: Number
  }],
  metadata: {
    views: Number,
    likes: Number,
    publishedAt: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);