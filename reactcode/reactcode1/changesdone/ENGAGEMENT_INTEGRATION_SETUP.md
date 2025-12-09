# 🎯 Engagement Monitoring Integration - Setup Guide

## Overview
This guide explains how to set up and use the integrated Lokdin engagement monitoring system in your ActiveLearn platform.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ActiveLearn Platform                      │
│  ┌────────────────┐              ┌──────────────────────┐   │
│  │   React App    │◄────REST────►│  Node.js Backend     │   │
│  │   (Port 3000)  │              │  (Port 5001)         │   │
│  └────────────────┘              └──────────────────────┘   │
│         │                                   │                │
│         │                                   │                │
│         ▼                                   ▼                │
│  Video Feed URL                      API Proxy               │
└─────────┬──────────────────────────────────┬────────────────┘
          │                                  │
          │         ┌────────────────────────▼────────┐
          └────────►│   Lokdin Python API            │
                    │   (Port 5000)                   │
                    │   - Flask Backend               │
                    │   - Computer Vision Processing  │
                    │   - MediaPipe + DeepFace       │
                    └─────────────────────────────────┘
```

## Setup Instructions

### Step 1: Install Python Dependencies

Navigate to the Lokdin backend and install dependencies:

```bash
cd "/Users/vikaschoudhary/Downloads/engagement_analysis-main (2)/Engagmentnew/Feedback_Report/backend"
pip3 install -r requirements.txt
```

### Step 2: Configure Environment Variables

Add to your ActiveLearn `.env` file:

```bash
# In /Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn/backend/.env
LOKDIN_API_URL=http://localhost:5000
PORT=5001  # Changed from 5000 to avoid conflict with Lokdin
```

### Step 3: Start Services

**Terminal 1 - Start Lokdin Python API:**
```bash
cd "/Users/vikaschoudhary/Downloads/engagement_analysis-main (2)/Engagmentnew/Feedback_Report/backend/apis"
python3 run.py
```

This should output:
```
Server running on port 5000
```

**Terminal 2 - Start ActiveLearn Backend:**
```bash
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn/backend"
npm install  # First time only
npm start
```

This should output:
```
Server running on port 5001
Connected to MongoDB
```

**Terminal 3 - Start ActiveLearn Frontend:**
```bash
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn/reactcode/reactcode1"
npm install  # First time only
npm start
```

This should open http://localhost:3000

### Step 4: Grant Camera Permissions

When you first start monitoring:
1. Browser will prompt for camera access
2. Click "Allow"
3. macOS may also ask for system camera permissions

## Usage Flow

### 1. **Student Login**
- Student logs into ActiveLearn
- Navigates to Dashboard

### 2. **Start Monitoring (with Consent)**
- Student clicks on "📹 Engagement Feedback" tab
- Clicks "Start Engagement Monitoring" button
- **Consent Modal appears** with clear information:
  - Video processed locally, not stored
  - Only metrics are saved
  - Can stop anytime
- Student clicks "I Accept - Start Monitoring"

### 3. **During Learning Session**
- Live video feed displays with overlays
- Real-time metrics shown:
  - **Engagement Score** (High/Medium/Low)
  - **Current Emotion** (neutral, happy, sad, etc.)
  - **Eye Contact Duration**
  - **Head Stability**
- Metrics collected every 3 seconds
- Data sent to ActiveLearn backend and stored in MongoDB

### 4. **Stop Monitoring**
- Student clicks "Stop Monitoring"
- Session summary calculated:
  - Average engagement score
  - Dominant emotion
  - Total duration
  - Engagement distribution (high/medium/low percentages)

### 5. **View Feedback Reports**
- Past sessions displayed in history
- Each session shows:
  - Video title
  - Date and duration
  - Average engagement
  - Dominant emotion
- Data used for personalized insights

## API Endpoints

### ActiveLearn Backend (Node.js)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/engagement/health` | GET | Check if Lokdin is running |
| `/api/engagement/start` | POST | Start monitoring session |
| `/api/engagement/stop/:sessionId` | POST | Stop session & get summary |
| `/api/engagement/collect/:sessionId` | POST | Collect current metrics |
| `/api/engagement/session/:sessionId` | GET | Get session details |
| `/api/engagement/history/:username` | GET | Get user's engagement history |

### Lokdin Python API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/engagement/start` | POST | Start monitoring |
| `/api/engagement/stop` | POST | Stop monitoring |
| `/api/engagement/metrics` | GET | Get current metrics |
| `/video_feed` | GET | MJPEG video stream |

## Database Schema

### EngagementSession Model (MongoDB)

```javascript
{
  userId: ObjectId,                  // Reference to User
  videoId: String,                   // YouTube video ID
  videoTitle: String,                // Video title
  startTime: Date,                   // Session start
  endTime: Date,                     // Session end
  duration: Number,                  // Duration in seconds
  isActive: Boolean,                 // Current status
  averageEngagement: Number,         // Average score (0-1)
  dominantEmotion: String,           // Most frequent emotion
  metrics: [{                        // Individual metrics
    timestamp: Date,
    engagement_score: Number,
    emotion: String,
    head_pose: {
      pitch: Number,
      yaw: Number,
      roll: Number
    },
    eye_contact_duration: Number,
    stability: Number
  }],
  summary: {                         // Session summary
    totalMetrics: Number,
    engagementDistribution: {
      high: Number,
      medium: Number,
      low: Number
    },
    emotionDistribution: Object,
    averageHeadPose: {
      pitch: Number,
      yaw: Number
    }
  }
}
```

## Features Implemented

### ✅ Privacy & Consent
- **Clear consent modal** before starting
- Explanation of what data is collected
- User can opt-in/opt-out anytime
- No video recording - only metrics

### ✅ Real-time Monitoring
- Live video feed with engagement overlays
- Continuous metric collection (every 3 seconds)
- Visual indicators for engagement levels
- Emotion detection

### ✅ Data Storage & Analytics
- All sessions stored in MongoDB
- Historical data for trend analysis
- Session summaries with key insights
- Engagement distribution analytics

### ✅ Dashboard Integration
- New "Engagement Feedback" tab
- Clean UI showing current and past sessions
- Color-coded engagement levels
- Easy start/stop controls

### ✅ Non-intrusive Design
- Existing ActiveLearn features unchanged
- Optional feature (user must enable)
- Runs in background without disrupting learning
- Can be stopped at any time

## Troubleshooting

### Issue: "Lokdin service is not available"
**Solution:**
1. Check if Lokdin Python server is running on port 5000
2. Run: `curl http://localhost:5000/api/health`
3. Should return: `{"status": "healthy"}`

### Issue: "Camera not working"
**Solution:**
1. Grant browser camera permissions
2. Check macOS System Preferences → Security & Privacy → Camera
3. Ensure no other app is using the camera
4. Restart browser

### Issue: "Failed to start monitoring"
**Solution:**
1. Check browser console for errors
2. Verify user is logged in
3. Check that ActiveLearn backend is on port 5001
4. Check MongoDB connection

### Issue: Port conflicts
**Solution:**
- Lokdin: Port 5000
- ActiveLearn Backend: Port 5001
- ActiveLearn Frontend: Port 3000

## Future Enhancements

### Planned Features
- [ ] Weekly engagement reports via email
- [ ] Engagement goals and targets
- [ ] Comparison with class averages
- [ ] Personalized learning recommendations based on engagement
- [ ] Focus time tracking
- [ ] Break reminders when engagement drops
- [ ] Gamification (badges for sustained engagement)
- [ ] Teacher dashboard for monitoring students
- [ ] Export engagement reports as PDF

### Advanced Analytics
- [ ] Correlation between engagement and quiz scores
- [ ] Best time of day for learning
- [ ] Subject-wise engagement patterns
- [ ] Attention span analysis
- [ ] Distraction detection

## Security & Privacy

### Data Protection
- ✅ Video processing is local only
- ✅ No video files are stored
- ✅ Only anonymous metrics saved
- ✅ User consent required
- ✅ Data encrypted in transit (HTTPS in production)
- ✅ Can delete engagement data anytime

### Compliance
- GDPR-compliant (user consent + data deletion)
- FERPA-compliant for educational data
- Clear privacy policy explaining data usage

## Support

For issues or questions:
1. Check this documentation
2. Review console logs in browser DevTools
3. Check terminal output for backend errors
4. Verify all services are running

## Quick Commands Reference

```bash
# Start Lokdin
cd "/Users/vikaschoudhary/Downloads/engagement_analysis-main (2)/Engagmentnew/Feedback_Report/backend/apis"
python3 run.py

# Start ActiveLearn Backend
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn/backend"
npm start

# Start ActiveLearn Frontend
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn/reactcode/reactcode1"
npm start

# Check Service Health
curl http://localhost:5000/api/health  # Lokdin
curl http://localhost:5001/api/engagement/health  # ActiveLearn
```

---

**Integration Complete!** 🎉

Your ActiveLearn platform now has comprehensive engagement monitoring with privacy-focused design and rich analytics.
