import { useState, useEffect } from 'react';
import { videoService } from '../services/videoService';

export function useVideos() {
	const [searchQuery, setSearchQuery] = useState("");
	const [videos, setVideos] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [articles, setArticles] = useState({});
	const [articleLoadingStates, setArticleLoadingStates] = useState({});

	useEffect(() => {
		const savedTopic = localStorage.getItem("lastTopic");
		if (savedTopic) {
			setSearchQuery(savedTopic);
			fetchVideos(savedTopic).catch(err => {
				console.error('Error in initial video fetch:', err);
				setError('Failed to load videos. Please try again later.');
			});
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchVideos = async (topic) => {
		setLoading(true);
		setError("");
		setVideos([]);
		setArticles({});
		setArticleLoadingStates({});
		
		try {
			await videoService.clearArticleCache();

			const data = await videoService.searchVideos(topic);
			
			if (!data?.items || data.items.length === 0) {
				throw new Error("No videos found for the given topic");
			}

			// Only set videos if we have valid data
			setVideos(data.items);
			
			// Fetch articles for each video
			const articlePromises = data.items.map(video => {
				if (video.id?.videoId) {
					return fetchArticlesForVideo(
						video.id.videoId, 
						video.snippet?.title || 'Untitled Video'
					).catch(err => {
						console.error(`Error fetching articles for video ${video.id.videoId}:`, err);
						return null; // Continue with other videos even if one fails
					});
				}
				console.warn('Skipping video with missing ID:', video);
				return Promise.resolve();
			});

			// Wait for all article fetches to complete
			await Promise.all(articlePromises);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const fetchArticlesForVideo = async (videoId, videoTitle) => {
		if (!videoId) {
			console.warn('Skipping article fetch - missing videoId');
			return;
		}

		try {
			setArticleLoadingStates(prev => ({
				...prev,
				[videoId]: true
			}));

			console.log(`Fetching articles for video ${videoId}: ${videoTitle}`);

			const data = await videoService.fetchArticles(videoId, videoTitle);

			if (data && data.articles) {
				setArticles(prev => ({
					...prev,
					[videoId]: data.articles
				}));
				console.log(`✅ Received ${data.articles.length} articles for video ${videoId}`);
			} else {
				console.warn('No articles received, using fallback');
				const fallbackArticles = videoService.generateFallbackArticles(videoTitle);
				setArticles(prev => ({
					...prev,
					[videoId]: fallbackArticles
				}));
			}
		} catch (err) {
			console.error('Failed to fetch articles from backend:', err);
			const fallbackArticles = videoService.generateFallbackArticles(videoTitle);
			setArticles(prev => ({
				...prev,
				[videoId]: fallbackArticles
			}));
		} finally {
			setArticleLoadingStates(prev => ({
				...prev,
				[videoId]: false
			}));
		}
	};

	const handleSearch = async () => {
		if (!searchQuery?.trim()) {
			setError('Please enter a search term');
			return;
		}

		try {
			const query = searchQuery.trim();
			localStorage.setItem("lastTopic", query);
			await fetchVideos(query);
		} catch (err) {
			console.error('Search error:', err);
			setError('Failed to search. Please try again.');
		}
	};

	return {
		searchQuery,
		setSearchQuery,
		videos,
		loading,
		error,
		articles,
		articleLoadingStates,
		handleSearch
	};
}
