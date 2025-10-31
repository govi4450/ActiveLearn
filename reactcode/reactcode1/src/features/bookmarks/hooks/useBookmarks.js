import { useState, useEffect } from 'react';
import { fetchBookmarks, addBookmark, removeBookmark, checkBookmark } from '../services/bookmarkService';

export function useBookmarks(currentUser) {
	const [bookmarks, setBookmarks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		if (!currentUser) {
			setLoading(false);
			return;
		}

		loadBookmarks();
	}, [currentUser]);

	const loadBookmarks = async () => {
		try {
			setLoading(true);
			const data = await fetchBookmarks(currentUser);
			setBookmarks(data);
			setError(null);
		} catch (err) {
			console.error('Error loading bookmarks:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const addToBookmarks = async (videoId, videoTitle, videoThumbnail, tags = [], notes = '') => {
		try {
			const newBookmark = await addBookmark(currentUser, videoId, videoTitle, videoThumbnail, tags, notes);
			setBookmarks(prev => [newBookmark, ...prev]);
			return true;
		} catch (err) {
			console.error('Error adding bookmark:', err);
			return false;
		}
	};

	const removeFromBookmarks = async (videoId) => {
		try {
			await removeBookmark(currentUser, videoId);
			setBookmarks(prev => prev.filter(b => b.videoId !== videoId));
			return true;
		} catch (err) {
			console.error('Error removing bookmark:', err);
			return false;
		}
	};

	const isBookmarked = async (videoId) => {
		try {
			return await checkBookmark(currentUser, videoId);
		} catch (err) {
			console.error('Error checking bookmark:', err);
			return false;
		}
	};

	return {
		bookmarks,
		loading,
		error,
		addToBookmarks,
		removeFromBookmarks,
		isBookmarked,
		refreshBookmarks: loadBookmarks
	};
}
