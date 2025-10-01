const axios = require('axios');

class YouTubeService {
  static async searchVideos(query, maxResults = 5) {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: {
            part: 'snippet',
            type: 'video',
            q: query,
            maxResults,
            key: process.env.YOUTUBE_API_KEY
          }
        }
      );
      return response.data.items;
    } catch (error) {
      console.error('YouTube search error:', error);
      throw new Error('Failed to search YouTube videos');
    }
  }

  static async getVideoDetails(videoIds) {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos`,
        {
          params: {
            part: 'statistics,contentDetails',
            id: videoIds.join(','),
            key: process.env.YOUTUBE_API_KEY
          }
        }
      );
      return response.data.items;
    } catch (error) {
      console.error('YouTube details error:', error);
      throw new Error('Failed to get video details');
    }
  }
}

module.exports = YouTubeService;