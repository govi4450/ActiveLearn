# Article Generation Feature - Changes Summary

## Problem Statement
Articles were repeating for each video, and some article links were redirecting to generic course pages (like Coursera) instead of direct article links.

## Solution Implemented
Completely redesigned the article generation system to use backend-based web scraping with intelligent filtering and deduplication.

---

## Files Created

### 1. `/backend/services/articleService.js` ✨ NEW
**Purpose**: Core service for fetching and filtering articles from Google Custom Search API

**Key Features**:
- Dual API key support with round-robin rotation
- Intelligent search query generation from video content
- Advanced filtering by trusted sources
- Article relevance scoring and ranking
- URL deduplication across videos
- Fallback article generation

**Main Methods**:
- `getArticlesForVideo()` - Main entry point for fetching articles
- `fetchArticlesFromGoogle()` - Calls Google Custom Search API
- `filterAndRankArticles()` - Filters and scores articles by relevance
- `extractKeyTopics()` - Extracts important keywords from summary
- `generateSearchQuery()` - Creates targeted search queries
- `clearCache()` - Clears article URL cache

### 2. `/backend/routes/articles.js` ✨ NEW
**Purpose**: API endpoints for article operations

**Endpoints**:
- `POST /api/articles/:videoId` - Get articles for single video
- `POST /api/articles/batch` - Get articles for multiple videos
- `POST /api/articles/clear-cache` - Clear article cache

### 3. `/backend/.env.example` ✨ NEW
**Purpose**: Template for environment variables

**New Variables**:
- `GOOGLE_SEARCH_API_KEY_1` - First Google Custom Search API key
- `GOOGLE_SEARCH_API_KEY_2` - Second API key for rate limiting
- `GOOGLE_SEARCH_ENGINE_ID` - Custom Search Engine ID

### 4. `/ARTICLE_FEATURE_SETUP.md` ✨ NEW
**Purpose**: Comprehensive setup and usage documentation

**Contents**:
- Setup instructions
- How to get Google API keys
- Architecture explanation
- API documentation
- Troubleshooting guide
- Testing procedures

### 5. `/backend/test-article-api.js` ✨ NEW
**Purpose**: Test script for verifying article API functionality

---

## Files Modified

### 1. `/backend/server.js` 🔧 MODIFIED
**Changes**:
- Added import for `articleRoutes`
- Registered `/api` route for article endpoints

**Lines Changed**:
```javascript
// Line 11: Added
const articleRoutes = require('./routes/articles');

// Line 28: Added
app.use('/api', articleRoutes);
```

### 2. `/reactcode/reactcode1/src/Reactvideo.js` 🔧 MODIFIED
**Major Changes**:
1. **Removed frontend Google API calls** - No longer calls Google Custom Search API directly
2. **Added backend integration** - Now calls backend API for articles
3. **Improved loading states** - Added per-video loading indicators
4. **Better error handling** - Graceful fallback when backend fails

**Key Changes**:
- Removed `GOOGLE_API_KEY` and `SEARCH_ENGINE_ID` constants
- Added `BACKEND_URL` constant
- Replaced `usedArticles` state with `articleLoadingStates`
- Removed `fetchArticles()` and `fetchRealArticles()` functions
- Added `fetchArticlesFromBackend()` function
- Updated `generateFallbackArticles()` to use video title instead of search topic
- Updated loading UI to show "Fetching unique articles..." message

**Before**:
```javascript
const fetchArticles = async (videoId, videoTitle, searchTopic) => {
  // Direct Google API call from frontend
  const response = await axios.get('https://www.googleapis.com/customsearch/v1', {...});
}
```

**After**:
```javascript
const fetchArticlesFromBackend = async (videoId, videoTitle) => {
  // Call backend API
  const response = await axios.post(`${BACKEND_URL}/api/articles/${videoId}`, {
    videoTitle: videoTitle
  });
}
```

---

## Technical Improvements

### 1. **Unique Articles Per Video**
- Each video generates a unique search query based on its title and content
- Articles are scored by relevance to specific video content
- URL deduplication prevents same article appearing multiple times

### 2. **Direct Article Links**
- Filters out generic course landing pages
- Excludes URLs with `/courses/` unless they're specific lectures
- Prioritizes direct article URLs from Wikipedia, academic sites, etc.

### 3. **Rate Limiting Handling**
- Dual API key system with round-robin rotation
- Automatic fallback to second key if first fails
- Graceful degradation to fallback articles if both fail

### 4. **Intelligent Search**
- Extracts key topics from video summary
- Combines video title + key topics for targeted search
- Filters by trusted educational sources only

### 5. **Better User Experience**
- Per-video loading indicators
- Clear feedback when fetching articles
- Fallback articles ensure content always displays

---

## Environment Setup Required

### Backend `.env` file needs:
```bash
GOOGLE_SEARCH_API_KEY_1=your_first_api_key
GOOGLE_SEARCH_API_KEY_2=your_second_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
```

### How to Get Keys:
1. **Google Cloud Console**: Create project, enable Custom Search API
2. **Create 2 API Keys**: For rate limiting (100 queries/day each)
3. **Programmable Search Engine**: Create search engine, get ID

Detailed instructions in `ARTICLE_FEATURE_SETUP.md`

---

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Environment variables are set correctly
- [ ] Search for a topic and videos load
- [ ] Each video shows "Fetching unique articles..." message
- [ ] Articles appear below each video (3 per video)
- [ ] Articles are different for each video
- [ ] Article links go to direct pages (not search pages)
- [ ] No repeated articles across videos
- [ ] Fallback works if API fails

---

## API Usage Example

### Request:
```bash
curl -X POST http://localhost:5000/api/articles/abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "videoTitle": "Introduction to Neural Networks"
  }'
```

### Response:
```json
{
  "success": true,
  "videoId": "abc123",
  "articles": [
    {
      "source": "wikipedia.org",
      "title": "Neural network - Wikipedia",
      "date": "Oct 4, 2025",
      "snippet": "A neural network is a network of interconnected nodes...",
      "url": "https://en.wikipedia.org/wiki/Neural_network"
    },
    {
      "source": "mit.edu",
      "title": "Introduction to Neural Networks | MIT",
      "date": "Oct 4, 2025",
      "snippet": "This course covers the fundamentals...",
      "url": "https://..."
    },
    {
      "source": "towardsdatascience.com",
      "title": "Understanding Neural Networks",
      "date": "Oct 4, 2025",
      "snippet": "Neural networks are computing systems...",
      "url": "https://..."
    }
  ],
  "count": 3
}
```

---

## Benefits

✅ **Unique Content**: Each video gets articles specific to its content  
✅ **No Repetition**: Deduplication ensures variety across videos  
✅ **Direct Links**: Users land on actual articles, not search pages  
✅ **Scalable**: Backend handles rate limiting and caching  
✅ **Reliable**: Fallback system ensures content always displays  
✅ **Maintainable**: Centralized logic in backend service  

---

## Next Steps

1. **Add API keys to `.env`** - Follow `ARTICLE_FEATURE_SETUP.md`
2. **Test the feature** - Run backend and frontend
3. **Monitor usage** - Check Google Cloud Console for API quota
4. **Optional**: Upgrade to paid plan for higher limits

---

**Date**: October 4, 2025  
**Status**: ✅ Complete and Ready for Testing
