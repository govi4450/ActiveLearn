import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { checkBookmark, addBookmark, removeBookmark } from '../services/bookmarkService';

function BookmarkButton({ currentUser, videoId, videoTitle, videoThumbnail }) {
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [loading, setLoading] = useState(false);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		if (currentUser && videoId) {
			checkIfBookmarked();
		}
	}, [currentUser, videoId]);

	const checkIfBookmarked = async () => {
		try {
			const bookmarked = await checkBookmark(currentUser, videoId);
			setIsBookmarked(bookmarked);
		} catch (error) {
			console.error('Error checking bookmark:', error);
		}
	};

	const toggleBookmark = async () => {
		if (!currentUser) {
			alert('Please login to bookmark videos');
			return;
		}

		setLoading(true);
		try {
			if (isBookmarked) {
				await removeBookmark(currentUser, videoId);
				setIsBookmarked(false);
			} else {
				await addBookmark(currentUser, videoId, videoTitle, videoThumbnail);
				setIsBookmarked(true);
			}
		} catch (error) {
			console.error('Error toggling bookmark:', error);
			alert('Failed to update bookmark');
		} finally {
			setLoading(false);
		}
	};

	return (
		<motion.button
			whileHover={{ scale: 1.1 }}
			whileTap={{ scale: 0.9 }}
			onClick={toggleBookmark}
			disabled={loading}
			className={`p-2 rounded-lg backdrop-blur-sm transition-all ${
				isBookmarked 
					? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg' 
					: 'bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md'
			}`}
			title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
		>
			{isBookmarked ? (
				<BookmarkCheck className="w-5 h-5" />
			) : (
				<Bookmark className="w-5 h-5" />
			)}
		</motion.button>
	);
}

export default BookmarkButton;
