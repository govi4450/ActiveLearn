# 🚀 ActiveLearn + Lokdin - Quick Start Guide

## One Command Startup

To start **everything** at once:

```bash
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn"
./start-all.sh
```

This will start:
1. ✅ Lokdin Engagement Detection Server (Port 5002)
2. ✅ ActiveLearn Backend (Port 5001)
3. ✅ ActiveLearn Frontend (Port 3000)

---

## Stop All Services

```bash
./stop-all.sh
```

---

## Manual Startup (If Needed)

### 1. Start Lokdin Server
```bash
cd "/Users/vikaschoudhary/Downloads/engagement_analysis-main (2)/Engagmentnew/Feedback_Report"
bash start_real_lokdin.sh
```

### 2. Start Backend
```bash
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn/backend"
npm start
```

### 3. Start Frontend
```bash
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn/reactcode/reactcode1"
npm start
```

---

## Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Lokdin API**: http://localhost:5002

---

## Troubleshooting

### Port Already in Use
If you get "port already in use" errors:
```bash
./stop-all.sh
./start-all.sh
```

### Camera Not Working
1. Make sure you allowed camera permissions in your browser
2. Check if Lokdin server is running: `curl http://localhost:5002/api/health`

### MongoDB Connection Issues
Make sure MongoDB is running:
```bash
brew services start mongodb-community
```

---

## Quick Test

After starting all services:
1. Open http://localhost:3000
2. Login with your credentials
3. Go to Dashboard → Engagement Feedback tab
4. Click "Start Monitoring"
5. Accept camera permissions
6. Watch your engagement metrics in real-time!

---

## Features

✅ Real-time engagement monitoring
✅ Emotion detection (happy, sad, neutral, etc.)
✅ Eye contact tracking
✅ Head pose analysis
✅ Distraction time calculation
✅ Session history with detailed reports
✅ Persistent data storage in MongoDB
