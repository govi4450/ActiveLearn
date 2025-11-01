# 🚀 Quick Start Guide

## Option 1: One-Command Startup (Recommended)

### Setup (First Time Only)

1. **Add environment variables:**
```bash
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn/backend"
```

Add to `.env` file:
```
LOKDIN_API_URL=http://localhost:5000
PORT=5001
```

2. **Install dependencies** (if not already done):
```bash
# Lokdin Python dependencies
cd "/Users/vikaschoudhary/Downloads/engagement_analysis-main (2)/Engagmentnew/Feedback_Report/backend"
pip3 install -r requirements.txt

# ActiveLearn backend dependencies
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn/backend"
npm install

# ActiveLearn frontend dependencies
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn/reactcode/reactcode1"
npm install
```

### Start Everything

**Single command:**
```bash
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn"
./start-all.sh
```

This will:
- ✅ Start Lokdin on port 5000
- ✅ Start ActiveLearn Backend on port 5001
- ✅ Start ActiveLearn Frontend on port 3000
- ✅ Open browser automatically

### Stop Everything

```bash
./stop-all.sh
```

Or press `Ctrl+C` in the terminal running `start-all.sh`

---

## Option 2: Manual Startup (For Debugging)

**Terminal 1 - Lokdin:**
```bash
cd "/Users/vikaschoudhary/Downloads/engagement_analysis-main (2)/Engagmentnew/Feedback_Report/backend/apis"
python3 run.py
```

**Terminal 2 - Backend:**
```bash
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn/backend"
npm start
```

**Terminal 3 - Frontend:**
```bash
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn/reactcode/reactcode1"
npm start
```

---

## Testing the Integration

1. **Open browser:** http://localhost:3000
2. **Login** to ActiveLearn
3. **Go to Dashboard**
4. **Click "📹 Engagement Feedback" tab**
5. **Click "Start Engagement Monitoring"**
6. **Accept consent** → Monitoring starts!

---

## Troubleshooting

### "Port already in use"
```bash
# Kill processes on ports
./stop-all.sh
```

### "Lokdin not available"
```bash
# Check if Lokdin is running
curl http://localhost:5000/api/health
# Should return: {"status":"healthy"}
```

### "Camera not working"
- Grant browser camera permissions
- Check macOS System Preferences → Security & Privacy → Camera
- Restart browser

---

## Project Structure

```
Active Leaarning /
└── ActiveLearn/              # Your main project
    ├── backend/              # Node.js server (Port 5001)
    ├── reactcode/reactcode1/ # React app (Port 3000)
    ├── start-all.sh         # ← Start everything
    └── stop-all.sh          # ← Stop everything

Downloads/
└── engagement_analysis-main (2)/
    └── Engagmentnew/Feedback_Report/
        └── backend/apis/     # Lokdin server (Port 5000)
```

---

## FAQ

### Q: Do I need to keep both projects separate?
**A:** Yes, but they run together automatically with `./start-all.sh`. The separation is good because:
- Python is better for computer vision
- Can scale independently
- Cleaner architecture

### Q: Can I deploy this to production?
**A:** Yes! You'll need to:
1. Deploy Lokdin Python API (Heroku, AWS, etc.)
2. Deploy ActiveLearn backend
3. Deploy ActiveLearn frontend
4. Update `LOKDIN_API_URL` to production URL

### Q: Does engagement monitoring work offline?
**A:** No, requires:
- Active internet for MongoDB
- Camera access
- Lokdin service running

### Q: Can other features work without engagement monitoring?
**A:** Yes! All existing ActiveLearn features work independently. Engagement is optional.

---

## What Happens When You Run It

```
./start-all.sh
    ↓
[1] Starts Lokdin (Python Flask)
    → Loads ML models (MediaPipe, DeepFace)
    → Listens on port 5000
    ↓
[2] Starts ActiveLearn Backend (Node.js)
    → Connects to MongoDB
    → Connects to Lokdin API
    → Listens on port 5001
    ↓
[3] Starts ActiveLearn Frontend (React)
    → Opens browser at localhost:3000
    → Ready to use!
```

---

**That's it! You're ready to go!** 🎉

Just run `./start-all.sh` and everything works together.
