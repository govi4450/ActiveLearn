import axios from 'axios';

const API_BASE_URL = '/api/notes';

export async function fetchNotesForVideo(username, videoId) {
	try {
		const response = await axios.get(`${API_BASE_URL}/${username}/${videoId}`);
		return response.data;
	} catch (error) {
		console.error('Error fetching notes:', error);
		throw error;
	}
}

export async function fetchAllNotes(username) {
	try {
		const response = await axios.get(`${API_BASE_URL}/${username}`);
		return response.data;
	} catch (error) {
		console.error('Error fetching all notes:', error);
		throw error;
	}
}

export async function addNote(username, videoId, timestamp, content) {
	try {
		const response = await axios.post(API_BASE_URL, {
			username,
			videoId,
			timestamp,
			content
		});
		return response.data;
	} catch (error) {
		console.error('Error adding note:', error);
		throw error;
	}
}

export async function updateNote(noteId, content) {
	try {
		const response = await axios.put(`${API_BASE_URL}/${noteId}`, { content });
		return response.data;
	} catch (error) {
		console.error('Error updating note:', error);
		throw error;
	}
}

export async function deleteNote(noteId) {
	try {
		const response = await axios.delete(`${API_BASE_URL}/${noteId}`);
		return response.data;
	} catch (error) {
		console.error('Error deleting note:', error);
		throw error;
	}
}
