import React, { useState, useEffect } from 'react';
import axios from 'axios';

// eslint-disable-next-line no-unused-vars
const TRUSTED_SOURCES = [
	"wikipedia.org", "khanacademy.org", "britannica.com", "edu.gov",
	"academia.edu", "scholar.google.com", "coursera.org", "edx.org",
	"mit.edu", "harvard.edu", "stanford.edu", "tutorialspoint.com",
	"geeksforgeeks.org", "towardsdatascience.com", "medium.com/education",
	"arxiv.org", "ted.com", "youtube.com", "smithsonianmag.com"
];

const apiKey = "AIzaSyDmlFU86ydq5734N5P_55KeYgKnJHj1GTY"; // YouTube API
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000'; 

function ReactVideo({ onSummarize, onQuiz, onPractice }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [videos, setVideos] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [articles, setArticles] = useState({});
	const [articleLoadingStates, setArticleLoadingStates] = useState({}); // Track loading state per video

	useEffect(() => {
		const savedTopic = localStorage.getItem("lastTopic");
		if (savedTopic) {
			setSearchQuery(savedTopic);
			fetchVideos(savedTopic);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSearch = () => {
		if (searchQuery) {
			localStorage.setItem("lastTopic", searchQuery);
			fetchVideos(searchQuery);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	const fetchVideos = async (topic) => {
		setLoading(true);
		setError("");
		setVideos([]);
		setArticles({});
		setArticleLoadingStates({}); // Reset article loading states
		
		try {
			// Clear article cache on backend for new search
			try {
				await axios.post(`${BACKEND_URL}/api/articles/clear-cache`);
				console.log('✅ Article cache cleared for new search');
			} catch (cacheErr) {
				console.warn('Failed to clear article cache:', cacheErr);
			}

			const response = await axios.get(
				`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(topic)}&maxResults=5&key=${apiKey}`
			);
			const data = response.data;
			if (!data.items || data.items.length === 0) {
				throw new Error("No videos found");
			}
			setVideos(data.items);
			
			// Fetch articles for each video from backend
			data.items.forEach(video => {
				fetchArticlesFromBackend(video.id.videoId, video.snippet.title);
			});
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const fetchArticlesFromBackend = async (videoId, videoTitle) => {
		try {
			// Set loading state for this video
			setArticleLoadingStates(prev => ({
				...prev,
				[videoId]: true
			}));

			console.log(`Fetching articles for video ${videoId}: ${videoTitle}`);

			// Call backend API to get articles
			const response = await axios.post(`${BACKEND_URL}/api/articles/${videoId}`, {
				videoTitle: videoTitle
			});

			if (response.data.success && response.data.articles) {
				setArticles(prev => ({
					...prev,
					[videoId]: response.data.articles
				}));
				console.log(`✅ Received ${response.data.articles.length} articles for video ${videoId}`);
			} else {
				throw new Error('Invalid response from backend');
			}
		} catch (err) {
			console.error('Failed to fetch articles from backend:', err);
			// Fallback to predefined articles if backend fails
			const fallbackArticles = generateFallbackArticles(videoTitle);
			setArticles(prev => ({
				...prev,
				[videoId]: fallbackArticles
			}));
		} finally {
			// Clear loading state
			setArticleLoadingStates(prev => ({
				...prev,
				[videoId]: false
			}));
		}
	};

	// Removed fetchRealArticles - now handled by backend

	const generateFallbackArticles = (videoTitle) => {
		// Fallback articles when backend API fails
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
	};


		return (
			<div className="video-module">
				<div className="search-container">
					<input
						id="searchQuery"
						type="text"
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Search topic for videos..."
					/>
					<button onClick={handleSearch}>Search</button>
				</div>
				<div className="video-container">
					{loading && (
						<div className="loading"><i className="fas fa-spinner fa-spin"></i> Searching videos...</div>
					)}
					{error && <div className="error">{error}</div>}
					{videos.length > 0 && (
						videos.map(video => (
							<div className="video-card" key={video.id.videoId}>
								<iframe
									src={`https://www.youtube.com/embed/${video.id.videoId}`}
									title={video.snippet.title}
									allowFullScreen
								/>
								<div className="video-content">
									<div className="video-title">{video.snippet.title}</div>
									<div className="video-actions">
										<button className="action-btn summarize" onClick={() => onSummarize(video.id.videoId)}>Summarize</button>
										<button className="action-btn quiz" onClick={() => onQuiz(video.id.videoId)}>Quiz</button>
										<button className="action-btn practice" onClick={() => onPractice(video.id.videoId)}>Practice</button>
									</div>
									<div className="video-articles">
										<div className="articles-heading">
											<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
												<polyline points="14,2 14,8 20,8"/>
												<line x1="16" y1="13" x2="8" y2="13"/>
												<line x1="16" y1="17" x2="8" y2="17"/>
												<polyline points="10,9 9,9 8,9"/>
											</svg>
											Related Articles
										</div>
										{articles[video.id.videoId] ? (
											<div className="articles-grid">
												{articles[video.id.videoId].map((article, index) => (
													<div className="article-card" key={index}>
														<div className="article-header">
															<span className="article-source">{article.source}</span>
															<span className="article-date">{article.date}</span>
														</div>
														<div className="article-title">{article.title}</div>
														<div className="article-snippet">{article.snippet}</div>
														<a href={article.url} target="_blank" rel="noopener noreferrer" className="article-link">
															<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
																<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
																<polyline points="14,2 14,8 20,8"/>
															</svg>
															Read Article
														</a>
													</div>
												))}
											</div>
										) : articleLoadingStates[video.id.videoId] ? (
											<div className="articles-loading">
												<svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
												</svg>
												Fetching unique articles...
											</div>
										) : (
											<div className="articles-loading">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
													<polyline points="7,10 12,15 17,10"/>
													<line x1="12" y1="15" x2="12" y2="3"/>
												</svg>
												Loading articles...
											</div>
										)}
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		);
}

export default ReactVideo;
