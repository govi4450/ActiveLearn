const mongoose = require('mongoose');

const engagementMetricSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  engagement_score: Number,
  emotion: String,
  head_pose: {
    pitch: Number,
    yaw: Number,
    roll: Number
  },
  eye_contact_duration: Number,
  stability: Number
});

const engagementSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoId: {
    type: String,
    required: true
  },
  videoTitle: String,
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: Number, // in seconds
  metrics: [engagementMetricSchema],
  averageEngagement: Number,
  dominantEmotion: String,
  isActive: {
    type: Boolean,
    default: true
  },
  summary: {
    totalMetrics: Number,
    engagementDistribution: {
      high: Number,    // engagement > 0.7
      medium: Number,  // 0.4 - 0.7
      low: Number      // < 0.4
    },
    emotionDistribution: mongoose.Schema.Types.Mixed,
    averageHeadPose: {
      pitch: Number,
      yaw: Number
    }
  }
}, {
  timestamps: true
});

// Calculate summary when session ends
engagementSessionSchema.methods.calculateSummary = function() {
  if (this.metrics.length === 0) {
    return;
  }

  // Calculate average engagement
  const scores = this.metrics
    .filter(m => m.engagement_score !== null && m.engagement_score !== undefined)
    .map(m => m.engagement_score);
  
  this.averageEngagement = scores.length > 0 
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length
    : null;

  // Engagement distribution
  const high = scores.filter(s => s > 0.7).length;
  const medium = scores.filter(s => s >= 0.4 && s <= 0.7).length;
  const low = scores.filter(s => s < 0.4).length;

  // Emotion distribution
  const emotions = {};
  this.metrics.forEach(m => {
    if (m.emotion) {
      emotions[m.emotion] = (emotions[m.emotion] || 0) + 1;
    }
  });

  // Find dominant emotion
  this.dominantEmotion = Object.keys(emotions).reduce((a, b) => 
    emotions[a] > emotions[b] ? a : b, 'neutral'
  );

  // Average head pose
  const headPoses = this.metrics.filter(m => m.head_pose);
  const avgPitch = headPoses.length > 0
    ? headPoses.reduce((sum, m) => sum + (m.head_pose.pitch || 0), 0) / headPoses.length
    : 0;
  const avgYaw = headPoses.length > 0
    ? headPoses.reduce((sum, m) => sum + (m.head_pose.yaw || 0), 0) / headPoses.length
    : 0;

  this.summary = {
    totalMetrics: this.metrics.length,
    engagementDistribution: { high, medium, low },
    emotionDistribution: emotions,
    averageHeadPose: {
      pitch: avgPitch,
      yaw: avgYaw
    }
  };
};

module.exports = mongoose.model('EngagementSession', engagementSessionSchema);
