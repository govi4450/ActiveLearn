# Article Generation Feature - Setup Guide

## Overview
The article generation feature has been completely redesigned to provide **unique, non-repetitive articles** for each video based on its content (summary and transcript). The system now uses backend-based web scraping with Google Custom Search API to find genuine, relevant articles from trusted sources.

## Key Improvements

### ✅ What's Fixed
1. **Unique Articles Per Video**: Each video now gets unique articles based on its specific content
2. **No Repetition**: Articles are tracked and deduplicated across videos in the same search session
3. **Direct Article Links**: Filters out generic course landing pages and provides direct article links
4. **Intelligent Search**: Uses video title + content summary to generate targeted search queries
5. **Dual API Key Support**: Implements round-robin API key rotation to handle rate limiting
6. **Trusted Sources Only**: Filters results to include only educational and reputable sources

### 🏗️ Architecture Changes
- **Before**: Frontend directly called Google Custom Search API
- **After**: Backend service handles article fetching with intelligent filtering and caching

## Setup Instructions

### 1. Environment Variables

Add the following to your `/backend/.env` file:

```bash
# Google Custom Search API Configuration
GOOGLE_SEARCH_API_KEY_1=your_first_google_api_key_here
GOOGLE_SEARCH_API_KEY_2=your_second_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_custom_search_engine_id_here
```

### 2. Get Google Custom Search API Keys

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Custom Search API**

#### Step 2: Get API Keys (You need 2 keys)
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the API key and save it as `GOOGLE_SEARCH_API_KEY_1`
4. Repeat to create a second API key and save as `GOOGLE_SEARCH_API_KEY_2`
5. (Optional) Restrict the keys to only allow Custom Search API

#### Step 3: Create Custom Search Engine
1. Go to [Google Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click **Add** to create a new search engine
3. Configure:
   - **Sites to search**: Select "Search the entire web"
   - **Name**: ActiveLearn Article Search (or any name)
4. After creation, click **Control Panel** → **Basics**
5. Copy the **Search engine ID** and save as `GOOGLE_SEARCH_ENGINE_ID`
6. Under **Search features**, enable:
   - ✅ Image search: OFF
   - ✅ Speech input: OFF
   - ✅ Safe search: ON

### 3. Install Backend Dependencies

The required dependencies should already be installed, but verify:

```bash
cd backend
npm install axios
```

### 4. Start the Backend Server

```bash
cd backend
npm start
```

The server should start on `http://localhost:5000`

### 5. Start the Frontend

```bash
cd reactcode/reactcode1
npm start
```

The frontend should start on `http://localhost:3000`

## How It Works

### Backend Flow
1. **Request**: Frontend sends video ID and title to `/api/articles/:videoId`
2. **Summary Generation**: If not provided, backend fetches transcript and generates summary
3. **Query Generation**: Extracts key topics from summary and video title
4. **Web Search**: Searches Google using Custom Search API with intelligent query
5. **Filtering**: Filters results by:
   - Trusted educational sources only
   - Relevance to video content
   - Excludes video results and generic course pages
   - Deduplicates across videos
6. **Ranking**: Scores articles by relevance and source quality
7. **Response**: Returns top 3 unique articles

### Trusted Sources
The system only accepts articles from:
- Educational institutions (.edu domains)
- Wikipedia, Britannica
- Khan Academy, Coursera, edX
- Academic sources (arxiv.org, scholar.google.com)
- Reputable publishers (Nature, Science Direct, JSTOR, etc.)

### Article Uniqueness
- Articles are tracked per search session
- Each video gets different articles based on its unique content
- URL deduplication prevents the same article appearing multiple times

## API Endpoints

### POST `/api/articles/:videoId`
Fetch articles for a single video.

**Request Body:**
```json
{
  "videoTitle": "String (required)",
  "summary": "String (optional)",
  "transcript": "String (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "videoId": "abc123",
  "articles": [
    {
      "source": "wikipedia.org",
      "title": "Article Title",
      "date": "Oct 4, 2025",
      "snippet": "Article description...",
      "url": "https://..."
    }
  ],
  "count": 3
}
```

### POST `/api/articles/batch`
Fetch articles for multiple videos at once.

**Request Body:**
```json
{
  "videos": [
    {
      "videoId": "abc123",
      "videoTitle": "Video Title",
      "summary": "Optional summary",
      "transcript": "Optional transcript"
    }
  ]
}
```

### POST `/api/articles/clear-cache`
Clear the article cache (useful for testing).

## Testing

### Manual Testing
1. Search for a topic (e.g., "Russian Revolution")
2. Wait for videos to load
3. Observe that each video shows "Fetching unique articles..."
4. Verify that articles appear below each video
5. Check that articles are different for each video
6. Click article links to verify they go to direct article pages (not search pages)

### Verify Uniqueness
- Articles should not repeat across different videos
- Each article should be relevant to its specific video content
- Links should go directly to article pages, not course landing pages

### Fallback Behavior
If the Google API fails or rate limits are hit:
- System automatically tries the second API key
- If both fail, shows fallback articles (Wikipedia, Britannica, Khan Academy)
- User still gets a functional experience

## Rate Limiting

### Google Custom Search API Limits
- **Free tier**: 100 queries/day per API key
- **With 2 keys**: 200 queries/day total
- **Per video**: ~1-2 API calls

### Optimization
- Backend caches results per session
- Round-robin API key rotation
- Efficient query generation reduces unnecessary calls

## Troubleshooting

### Issue: "No articles found" or fallback articles showing
**Solution**: Check that:
1. API keys are correctly set in `.env`
2. Custom Search Engine ID is correct
3. API keys have Custom Search API enabled
4. You haven't exceeded daily quota (100 queries/key)

### Issue: Articles still repeating
**Solution**: 
1. Clear browser cache
2. Call `/api/articles/clear-cache` endpoint
3. Restart backend server

### Issue: "Failed to fetch articles from backend"
**Solution**:
1. Verify backend is running on port 5000
2. Check backend console for errors
3. Verify CORS is enabled in backend
4. Check network tab in browser DevTools

### Issue: Rate limit exceeded
**Solution**:
1. Wait 24 hours for quota reset
2. Create additional API keys
3. Consider upgrading to paid Google Cloud plan

## File Structure

```
backend/
├── services/
│   └── articleService.js       # Core article fetching logic
├── routes/
│   └── articles.js             # API endpoints
├── server.js                   # Updated with article routes
└── .env                        # API keys configuration

reactcode/reactcode1/src/
└── Reactvideo.js              # Updated to use backend API
```

## Future Enhancements

Potential improvements:
- [ ] Cache articles in database for faster retrieval
- [ ] Add user preferences for article sources
- [ ] Implement article bookmarking
- [ ] Add article reading time estimates
- [ ] Support for multiple languages
- [ ] Article relevance feedback system

## Support

If you encounter issues:
1. Check backend console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test API keys using Google's API Explorer
4. Check browser console for frontend errors

---

**Last Updated**: October 4, 2025
**Version**: 2.0
