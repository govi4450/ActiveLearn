# 🔧 Troubleshooting Guide

## "Network Error" on Home Screen

### What It Means
The floating engagement widget tries to connect to the backend when the page loads. If the backend isn't running yet, you'll see a "Network Error" message.

### ✅ Fixed!
The widget now handles this gracefully:
- ✓ No error messages when backend is offline
- ✓ Widget still appears and works
- ✓ Helpful message if you try to start monitoring without backend

### How to Start Everything Correctly

**Option 1: One Command (Recommended)**
```bash
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn"
./start-all.sh
```

**Option 2: Manual (For Debugging)**

Start in this order:

**Terminal 1 - Lokdin Backend:**
```bash
cd "/Users/vikaschoudhary/Downloads/engagement_analysis-main (2)/Engagmentnew/Feedback_Report/backend"
python3 -m apis.run
```
Wait for: `Running on http://127.0.0.1:5000`

**Terminal 2 - ActiveLearn Backend:**
```bash
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn/backend"
npm start
```
Wait for: `Server running on port 5001`

**Terminal 3 - ActiveLearn Frontend:**
```bash
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn/reactcode/reactcode1"
npm start
```
Browser opens automatically.

---

## Common Issues

### 1. "Lokdin service is not available"

**Cause:** Python backend isn't running

**Fix:**
```bash
cd "/Users/vikaschoudhary/Downloads/engagement_analysis-main (2)/Engagmentnew/Feedback_Report/backend"
python3 -m apis.run
```

**Check if it's running:**
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"healthy","service":"Lokdin API"}
```

---

### 2. "Backend service is not running"

**Cause:** Node.js backend isn't running

**Fix:**
```bash
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn/backend"
npm start
```

**Check if it's running:**
```bash
curl http://localhost:5001/api/engagement/health
# Should return: {"lokdinAvailable":true,"message":"Lokdin service is running"}
```

---

### 3. Port Already in Use

**Symptoms:**
- `Error: listen EADDRINUSE: address already in use :::5000`
- `Error: listen EADDRINUSE: address already in use :::5001`

**Fix:**
```bash
# Kill all services and restart
./stop-all.sh
./start-all.sh
```

Or manually:
```bash
# Kill specific ports
lsof -ti:5000 | xargs kill -9
lsof -ti:5001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

---

### 4. Camera Not Working

**Symptoms:**
- "Permission denied" when starting monitoring
- Black screen in video feed

**Fix:**
1. **Grant browser permissions:**
   - Click camera icon in address bar
   - Select "Allow"
   
2. **Grant macOS permissions:**
   - System Preferences → Security & Privacy → Camera
   - Enable for your browser (Chrome/Firefox/Safari)

3. **Check camera availability:**
   - Make sure no other app is using camera
   - Restart browser
   - Try different browser

---

### 5. Widget Not Appearing

**Symptoms:**
- No floating widget on home screen

**Checks:**
1. Are you logged in?
2. Are you on the Videos/Home page?
3. Check browser console for errors (F12)

**Fix:**
```bash
# Restart frontend
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn/reactcode/reactcode1"
npm start
```

---

### 6. Database Connection Error

**Symptoms:**
- `MongoNetworkError: connect ECONNREFUSED`
- Backend logs show MongoDB connection failed

**Fix:**
1. Make sure MongoDB is running
2. Check `.env` file has correct `MONGODB_URI`
3. Test connection:
```bash
mongosh "your_connection_string"
```

---

### 7. Module Not Found Errors

**Symptoms:**
- `Cannot find module 'axios'`
- `Cannot find module 'flask_cors'`

**Fix for React:**
```bash
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn/reactcode/reactcode1"
npm install
```

**Fix for Python:**
```bash
cd "/Users/vikaschoudhary/Downloads/engagement_analysis-main (2)/Engagmentnew/Feedback_Report/backend"
pip3 install -r requirements.txt
```

**Fix for Node.js:**
```bash
cd "/Users/vikaschoudhary/Documents/Active Leaarning /ActiveLearn/backend"
npm install
```

---

## Quick Health Check Script

Create this file to quickly check all services:

```bash
#!/bin/bash
echo "Checking Lokdin (Port 5000)..."
curl -s http://localhost:5000/api/health && echo " ✓" || echo " ✗"

echo "Checking ActiveLearn Backend (Port 5001)..."
curl -s http://localhost:5001/api/engagement/health && echo " ✓" || echo " ✗"

echo "Checking ActiveLearn Frontend (Port 3000)..."
curl -s http://localhost:3000 > /dev/null && echo " ✓" || echo " ✗"
```

---

## Still Having Issues?

1. **Check logs:**
   - `/tmp/lokdin.log`
   - `/tmp/activelearn-backend.log`
   - `/tmp/activelearn-frontend.log`

2. **Browser console:**
   - Press F12
   - Check Console tab for errors

3. **Verify environment:**
   ```bash
   # Python version
   python3 --version  # Should be 3.8+
   
   # Node version
   node --version     # Should be 14+
   
   # npm version
   npm --version      # Should be 6+
   ```

4. **Clean restart:**
   ```bash
   ./stop-all.sh
   # Wait 5 seconds
   ./start-all.sh
   ```

---

## Development Tips

### Watch Logs in Real-Time
```bash
# Terminal 1
tail -f /tmp/lokdin.log

# Terminal 2
tail -f /tmp/activelearn-backend.log

# Terminal 3
tail -f /tmp/activelearn-frontend.log
```

### Debug Mode
To see detailed logs, start services manually instead of using `start-all.sh`

---

## Contact & Support

If issues persist:
1. Check browser console (F12 → Console)
2. Check all logs
3. Verify all ports are free
4. Try clean restart
5. Check this documentation

**Quick Reference:**
- Lokdin API: http://localhost:5000
- ActiveLearn Backend: http://localhost:5001
- ActiveLearn Frontend: http://localhost:3000
- Start All: `./start-all.sh`
- Stop All: `./stop-all.sh`
