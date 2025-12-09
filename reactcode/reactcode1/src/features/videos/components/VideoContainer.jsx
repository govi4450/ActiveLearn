import React, { useState } from 'react';
import { useVideos } from '../hooks/useVideos';
import VideoSearch from './VideoSearch';
import VideoCardNew from './VideoCardCanonical';
import VideoCardSkeleton from '../../../components/VideoCardSkeleton';
import { trackVideoWatch } from '../../library/services/topicDocumentService';
import LiveEngagementWidget from '../../engagement/components/LiveEngagementWidget';

function VideoContainer({ onSummarize, onQuiz, onPractice, onMindMap, onPlay, onNotes, currentUser }) {
	const [playingVideoId, setPlayingVideoId] = useState(null);
	const [selectedVideoId, setSelectedVideoId] = useState(null); // the featured card (remains until user selects another)
	// filters and view state
	const [activeFilter, setActiveFilter] = useState('all');
	const [durationFilter, setDurationFilter] = useState('any'); // any | short | medium | long
	const [viewMode, setViewMode] = useState('grid');

	const handlePlayToggle = async (id) => {
		if (playingVideoId === id) {
			// stop playback but keep the video selected as featured
			setPlayingVideoId(null);
		} else {
			// start playback and make this the selected/featured video
			setSelectedVideoId(id);
			setPlayingVideoId(id);
			
			// Track video watch for library
			if (currentUser && searchQuery) {
				const video = videos.find(v => (v.id?.videoId || v.id) === id);
				if (video) {
					try {
						const videoTitle = video.snippet?.title || 'Untitled Video';
						const keywords = extractKeywords(videoTitle, searchQuery);
						await trackVideoWatch(currentUser, id, videoTitle, searchQuery.trim(), keywords);
						console.log('✅ Video tracked for library:', videoTitle);
					} catch (error) {
						console.error('Failed to track video:', error);
					}
				}
			}
		}
	};
	
	// Extract keywords from video title and search query
	const extractKeywords = (title, topic) => {
		const stopWords = ['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but'];
		const words = (title + ' ' + topic)
			.toLowerCase()
			.replace(/[^\w\s]/g, '')
			.split(/\s+/)
			.filter(word => word.length > 3 && !stopWords.includes(word));
		
		// Get unique keywords, limit to 5
		return [...new Set(words)].slice(0, 5);
	};
	const {
		searchQuery,
		setSearchQuery,
		videos,
		loading,
		error,
	articles,
		handleSearch
	} = useVideos();

	return (
		<div className="w-full">
			{/* Live Engagement Widget - Floats on screen */}
			<LiveEngagementWidget currentUser={currentUser} isVisible={true} />
			
			<VideoSearch 
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				onSearch={handleSearch}
				activeFilter={activeFilter}
				setActiveFilter={setActiveFilter}
				durationFilter={durationFilter}
				setDurationFilter={setDurationFilter}
				viewMode={viewMode}
				setViewMode={setViewMode}
			/>
			
			{/* Error State */}
			{error && (
				<div className="max-w-md mx-auto mt-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
					<p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
				</div>
			)}

			{/* Loading Skeletons */}
			{loading && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<VideoCardSkeleton key={i} />
					))}
				</div>
			)}

			{/* Video Grid */}
			{!loading && videos.length > 0 && (
				<>
					<div className="flex items-center gap-3 mb-6 mt-8">
						<div className="flex items-center gap-2">
								<svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
								</svg>
								<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
									Trending in <span className="text-primary-600 dark:text-primary-400">
										{(searchQuery && searchQuery.trim()) ? `"${searchQuery.trim()}"` : 'All Topics'}
									</span>
								</h2>
						</div>
					</div>
					
					{/* Video Grid - Featured + Regular */}
					<div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-4'}>
						{(() => {
							// Helper: parse ISO8601 duration PT#H#M#S -> seconds
							const parseDurationSeconds = (iso) => {
								if (!iso) return 0;
								const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
								if (!match) return 0;
								const h = parseInt(match[1] || '0', 10);
								const m = parseInt(match[2] || '0', 10);
								const s = parseInt(match[3] || '0', 10);
								return h * 3600 + m * 60 + s;
							};

							const durationMatches = (video) => {
								if (activeFilter !== 'duration') return true;
								if (durationFilter === 'any') return true;
								const seconds = parseDurationSeconds(video.contentDetails?.duration);
								if (durationFilter === 'short') return seconds > 0 && seconds < 4 * 60;
								if (durationFilter === 'medium') return seconds >= 4 * 60 && seconds <= 20 * 60;
								if (durationFilter === 'long') return seconds > 20 * 60;
								return true;
							};

							// Start with videos that match duration filter
							let ordered = videos.filter(durationMatches);

							// Ensure selectedVideoId stays featured if available
							const featuredId = selectedVideoId || (ordered[0] && (ordered[0].id?.videoId || ordered[0].id));
							if (featuredId) {
								const idx = ordered.findIndex(v => (v.id?.videoId || v.id) === featuredId);
								if (idx > -1) {
									const picked = ordered[idx];
									ordered = [picked, ...ordered.slice(0, idx), ...ordered.slice(idx + 1)];
								}
							}

							return ordered.map((video, index) => (
								<VideoCardNew
									key={(video.id?.videoId || video.id)}
									video={video}
									featured={index === 0}
									onSummarize={onSummarize}
									onQuiz={onQuiz}
									onPractice={onPractice}
									onMindMap={onMindMap}
									// Toggle play via container handler; this will also set selection when starting
									onPlay={handlePlayToggle}
									// Expand to modal/fullscreen uses the parent's onPlay (which opens modal)
									onExpand={(id) => onPlay && onPlay(id)}
									onNotes={onNotes}
									currentUser={currentUser}
									isPlaying={playingVideoId === (video.id?.videoId || video.id)}
								/>
							));
						})()}
					</div>

					{/* Articles Section - Single Row of 4 Unique Articles */}
					{Object.keys(articles).length > 0 && (() => {
						// Collect all articles and get 4 unique ones
						const allArticles = [];
						Object.values(articles).forEach(videoArticles => {
							if (videoArticles && Array.isArray(videoArticles)) {
								allArticles.push(...videoArticles);
							}
						});
						
						// Get 4 unique articles based on URL
						const uniqueArticles = [];
						const seenUrls = new Set();
						for (const article of allArticles) {
							if (article && article.url && !seenUrls.has(article.url) && uniqueArticles.length < 4) {
								seenUrls.add(article.url);
								uniqueArticles.push(article);
							}
						}
						
						if (uniqueArticles.length === 0) return null;
						
						return (
							<div className="mt-16">
								<div className="flex items-center gap-3 mb-6">
									<svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
									</svg>
									<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
										Related Articles
									</h2>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
									{uniqueArticles.map((article, index) => (
										<a
											key={index}
											href={article.url}
											target="_blank"
											rel="noopener noreferrer"
											className="group bg-[#1a2332] rounded-xl p-5 border border-[#2a3442] hover:border-[#22d3ee] transition-all hover:shadow-lg"
										>
											<h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-[#22d3ee] transition-colors">
												{article.title}
											</h3>
											<p className="text-gray-400 text-sm line-clamp-2 mb-3">
												{article.description}
											</p>
											<div className="flex items-center justify-between text-xs text-gray-500">
												<span className="truncate">{new URL(article.url).hostname}</span>
												<svg className="w-4 h-4 text-[#22d3ee] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
												</svg>
											</div>
										</a>
									))}
								</div>
							</div>
						);
					})()}
				</>
			)}

			{/* Empty State */}
			{!loading && !error && videos.length === 0 && (
				<div className="max-w-md mx-auto mt-16 text-center">
					<div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
						<svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No videos found</h3>
					<p className="text-gray-600 dark:text-gray-400">Try searching for something to get started!</p>
				</div>
			)}
		</div>
	);
}

export default VideoContainer;
