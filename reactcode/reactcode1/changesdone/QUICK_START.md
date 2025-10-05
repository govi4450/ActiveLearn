# Quick Start Guide - Article Feature

## 🚀 Get Started in 5 Minutes

### Step 1: Add API Keys to `.env`

Open `/backend/.env` and add these three lines:

```bash
GOOGLE_SEARCH_API_KEY_1=your_first_api_key_here
GOOGLE_SEARCH_API_KEY_2=your_second_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

**Don't have API keys yet?** See detailed instructions in `ARTICLE_FEATURE_SETUP.md`

### Step 2: Start Backend

```bash
cd backend
npm start
```

You should see: `Server running on port 5000`

### Step 3: Start Frontend

```bash
cd reactcode/reactcode1
npm start
```

Browser should open at `http://localhost:3000`

### Step 4: Test It!

1. Search for any topic (e.g., "Machine Learning")
2. Wait for videos to load
3. Watch as unique articles appear below each video
4. Click article links to verify they work
5. Notice each video has different, relevant articles

---

## ✅ What to Expect

### Before (Old System):
- ❌ Same articles repeated for all videos
- ❌ Links to Coursera search pages
- ❌ Generic, non-specific content

### After (New System):
- ✅ Unique articles for each video
- ✅ Direct links to actual articles
- ✅ Content specific to each video's topic
- ✅ From trusted educational sources only

---

## 🔧 Quick Troubleshooting

### "Failed to fetch articles"
→ Check that backend is running on port 5000

### Seeing fallback articles (Wikipedia, Britannica, Khan Academy)
→ API keys not set or invalid in `.env`

### Articles still repeating
→ Clear browser cache and restart backend

---

## 📚 Need More Help?

- **Full Setup Guide**: `ARTICLE_FEATURE_SETUP.md`
- **Changes Summary**: `CHANGES_SUMMARY.md`
- **Test API**: Run `node backend/test-article-api.js`

---

**Ready to go!** 🎉
