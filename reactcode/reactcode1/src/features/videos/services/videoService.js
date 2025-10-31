import axios from 'axios';
import { BACKEND_URL } from '../../../config/constants';

export const videoService = {
    async searchVideos(topic) {
        try {
            console.log('Searching for videos with topic:', topic);
            const response = await axios.get('/api/youtube/search', {
                baseURL: BACKEND_URL,
                params: { 
                    q: topic 
                },
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('YouTube API Response:', response.data);
            
            if (!response.data || !response.data.items) {
                console.warn('Unexpected response format:', response.data);
                throw new Error('No videos found or invalid response format');
            }
            
            return response.data;
        } catch (error) {
            console.error('Error in searchVideos:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    },

    async getVideoById(videoId) {
        try {
            console.log('Fetching video by ID:', videoId);
            const response = await axios.get(`/api/youtube/videos/${videoId}`, {
                baseURL: BACKEND_URL,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log('Video by ID response:', response.data);

            if (!response.data || !response.data.items || response.data.items.length === 0) {
                throw new Error('Video not found');
            }

            // Transform the response to match the search format
            const transformedData = {
                ...response.data,
                items: response.data.items.map(item => ({
                    ...item,
                    id: { videoId: item.id },
                    snippet: {
                        ...item.snippet,
                        title: item.snippet?.title || 'Untitled Video',
                        description: item.snippet?.description || '',
                        thumbnails: item.snippet?.thumbnails || {
                            default: { url: '' },
                            medium: { url: '' },
                            high: { url: '' }
                        }
                    }
                }))
            };

            return transformedData;
        } catch (error) {
            console.error('Error in getVideoById:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    },

    async fetchArticles(videoId, videoTitle) {
		const title = videoTitle || 'Untitled Video';
		
		if (!videoId) {
			console.error('No videoId provided to fetchArticles');
			return {
				success: true, // Mark as success to prevent error state
				articles: this.generateFallbackArticles(title)
			};
		}

		try {
			console.log(`Fetching articles for video: ${videoId}`);
			const response = await axios.post(`/api/articles/${videoId}`, {
				videoTitle: title
			});
			
			if (response.data && response.data.articles) {
				return response.data;
			}
			
			// If response doesn't have articles, return fallback
			console.warn('No articles in response, using fallback');
			return {
				success: true,
				articles: this.generateFallbackArticles(title)
			};
		} catch (error) {
			console.error('Error fetching articles:', error);
			// Return fallback articles on error
			return {
				success: true, // Mark as success to prevent error state
				articles: this.generateFallbackArticles(title)
			};
		}
	},

	async clearArticleCache() {
		try {
			await axios.post(`${BACKEND_URL}/api/articles/clear-cache`);
			console.log('✅ Article cache cleared for new search');
		} catch (err) {
			console.warn('Failed to clear article cache:', err);
		}
	},

	generateFallbackArticles(videoTitle) {
		const topic = videoTitle.split(' ').slice(0, 3).join(' ');
		
		return [
			{
				source: 'wikipedia.org',
				title: `${topic} - Wikipedia`,
				date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
				snippet: `Comprehensive information about ${topic} and related concepts.`,
				url: `https://en.wikipedia.org/wiki/${encodeURIComponent(topic.replace(/\s+/g, '_'))}`
			},
			{
				source: 'britannica.com',
				title: `${topic} | Britannica`,
				date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
				snippet: `Detailed encyclopedia entry about ${topic}.`,
				url: `https://www.britannica.com/search?query=${encodeURIComponent(topic)}`
			},
			{
				source: 'khanacademy.org',
				title: `Learn ${topic} - Khan Academy`,
				date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
				snippet: `Interactive learning materials and exercises related to ${topic}.`,
				url: `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(topic)}`
			}
		];
	}
};
