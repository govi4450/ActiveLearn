# Testing Guide: Fix for Off-Topic Questions

## Problem
Questions were showing generic ML content instead of video-specific content because:
1. **Quiz Mode:** Frontend was using hardcoded sample questions
2. **Practice Mode:** Frontend was also using hardcoded sample questions
3. Backend was returning cached questions from previous searches
4. Prompt wasn't strict enough about content adherence
5. Questions had meta-references like "in the video" or "according to the transcript"

## Changes Made

### 1. Quiz Mode (`reactcode/reactcode1/src/Reactquestions.js`)
- ✅ Removed hardcoded ML questions
- ✅ Now fetches from `/api/generate_questions?video_id=<id>`
- ✅ Added "Regenerate Questions" button to force refresh
- ✅ Supports backend types: `mcq`, `true_false`, `short_answer`

### 2. Practice Mode (`reactcode/reactcode1/src/Reactpractice.js`)
- ✅ Removed hardcoded ML questions
- ✅ Now fetches from same API as Quiz mode
- ✅ Added "Regenerate Questions" button
- ✅ Shows answers with "Show Answer" toggle
- ✅ Uses same video-specific questions

### 2. Backend (`backend/controllers/questionController.js`)
- ✅ Normalizes LLM output types to match schema
- ✅ Maps `q.answer` → `correctAnswer`
- ✅ Added logging to track which video is being processed
- ✅ Shows cache status in logs

### 3. Prompt Enhancement (`backend/services/geminiService.js`)
- ✅ Stricter instructions to only use video content
- ✅ Explicit verification steps
- ✅ No generic knowledge allowed
- ✅ **Professional question style:** No meta-references like "in the video" or "according to the transcript"
- ✅ **Concept-focused:** Questions test understanding of concepts, not about the video itself
- ✅ **Examples provided:** Shows AI what NOT to do (bad examples) and what TO do (good examples)

## How to Test

### Step 1: Start Backend
```bash
cd backend
node server.js
```

You should see:
```
MongoDB Connected: ...
Server running on port 3000
```

### Step 2: Start React Dev Server (in new terminal)
```bash
cd reactcode/reactcode1
npm start
```

This will open http://localhost:3001 (or next available port)

### Step 3: Test the Fix

1. **Search for a specific topic** (e.g., "force and mass 11 class")

2. **Test Quiz Mode:**
   - Click "Quiz" on any video
   - If you see generic ML questions → Click "🔄 Regenerate Questions"
   - Wait for new questions to generate
   - **Verify questions:**
     - ✅ Questions are about the video topic (physics, not ML)
     - ✅ Questions are professional (no "in the video" phrases)
     - ✅ Questions test concepts, not meta-information

3. **Test Practice Mode:**
   - Click "Practice" on the same video
   - Should show same questions as Quiz mode
   - Click "Show Answer" to reveal answers
   - If off-topic → Click "🔄 Regenerate Questions"

4. **Check backend logs:**
```
📝 Question generation request for video: <video_id>, force: true, user: anonymous
🔥 Force option detected. Deleting existing questions...
✅ Existing questions deleted.
🤖 Generating questions with Gemini...
✅ Generated 10 questions for video <video_id>
```

### Step 4: Verify Questions are Professional and On-Topic

**✅ GOOD Examples:**
- "What is the relationship between force, mass, and acceleration?"
- "Energy can be _______ but not created or destroyed."
- "Which formula is used to calculate work done by a force?"
- Questions focus on concepts explained in the video
- Professional educational tone

**❌ BAD Examples:**
- "According to the video, what is Newton's second law?"
- "In the transcript, which formula is mentioned?"
- "The speaker explains that energy can be _______"
- Generic ML questions when searching for physics
- Questions about the video/speaker itself

**If you see bad examples:**
- Click "🔄 Regenerate Questions" button
- Wait for fresh generation
- Check backend logs to ensure correct video_id

## Troubleshooting

### Issue: Still seeing old questions
**Solution:** Click the "🔄 Regenerate Questions" button in the UI

### Issue: Questions still off-topic after regeneration
**Check:**
1. Backend logs - is correct video_id being sent?
2. Is transcript being fetched successfully?
3. Check the prompt output in backend logs (search for "---PROMPT START---")

### Issue: "Failed to load questions" error
**Check:**
1. Is backend running on port 3000?
2. Check backend terminal for errors
3. Verify MongoDB connection is active

### Issue: Proxy errors in React dev server
**Solution:** 
- Make sure backend is running FIRST on port 3000
- Then start React dev server
- React dev server will use port 3001 and proxy API calls to 3000

## Production Deployment

When ready to deploy:

```bash
# Build React app
cd reactcode/reactcode1
npm run build

# Backend will serve the built files from backend/server.js
# The static files are served from: ../reactcode/reactcode1/build
```

## Database Cleanup (if needed)

If you want to clear ALL old questions:

```javascript
// In MongoDB shell or Compass
db.questions.deleteMany({})
```

Or programmatically:
```bash
# In backend directory
node -e "require('./config/database')(); const Question = require('./models/Question'); Question.deleteMany({}).then(() => { console.log('All questions deleted'); process.exit(); });"
```

## Expected Behavior After Fix

1. **First time clicking Quiz on a video:** 
   - Fetches transcript
   - Generates summary (if not cached)
   - Generates 10 questions from transcript+summary
   - Saves to database
   - Shows questions

2. **Second time clicking Quiz on same video:**
   - Returns cached questions (fast)
   - Shows "♻️ Returning X cached questions" in backend logs

3. **Clicking "Regenerate Questions":**
   - Deletes old questions
   - Generates fresh questions from transcript+summary
   - Updates database

## Verification Checklist

- [ ] Backend starts without errors
- [ ] React app connects to backend
- [ ] Can search for videos
- [ ] Quiz button opens modal
- [ ] Questions load (may show old cached ones first)
- [ ] "Regenerate Questions" button appears
- [ ] Clicking regenerate fetches new questions
- [ ] New questions are specific to the video topic
- [ ] Backend logs show correct video_id
- [ ] No ML questions when searching for physics topics
