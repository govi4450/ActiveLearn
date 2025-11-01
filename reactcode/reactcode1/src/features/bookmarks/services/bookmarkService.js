import axios from 'axios';

const API_BASE_URL = '/api/bookmarks';

export async function fetchBookmarks(username) {
	try {
		const response = await axios.get(`${API_BASE_URL}/${username}`);
		return response.data;
	} catch (error) {
		console.error('Error fetching bookmarks:', error);
		throw error;
	}
}

export async function addBookmark(username, videoId, videoTitle, videoThumbnail, tags = [], notes = '') {
	try {
		const response = await axios.post(API_BASE_URL, {
			username,
			videoId,
			videoTitle,
			videoThumbnail,
			tags,
			notes
		});
		return response.data;
	} catch (error) {
		console.error('Error adding bookmark:', error);
		throw error;
	}
}

export async function removeBookmark(username, videoId) {
	try {
		const response = await axios.delete(`${API_BASE_URL}/${username}/${videoId}`);
		return response.data;
	} catch (error) {
		console.error('Error removing bookmark:', error);
		throw error;
	}
}

export async function checkBookmark(username, videoId) {
	try {
		const response = await axios.get(`${API_BASE_URL}/check/${username}/${videoId}`);
		return response.data.bookmarked;
	} catch (error) {
		console.error('Error checking bookmark:', error);
		return false;
	}
}
