import { useState, useEffect } from 'react';
import { fetchNotesForVideo, fetchAllNotes, addNote, updateNote, deleteNote } from '../services/noteService';

export function useNotes(currentUser, videoId = null) {
	const [notes, setNotes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		if (!currentUser) {
			setLoading(false);
			return;
		}

		loadNotes();
	}, [currentUser, videoId]);

	const loadNotes = async () => {
		try {
			setLoading(true);
			const data = videoId 
				? await fetchNotesForVideo(currentUser, videoId)
				: await fetchAllNotes(currentUser);
			setNotes(data);
			setError(null);
		} catch (err) {
			console.error('Error loading notes:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const createNote = async (videoId, timestamp, content) => {
		try {
			const newNote = await addNote(currentUser, videoId, timestamp, content);
			setNotes(prev => [newNote, ...prev]);
			return true;
		} catch (err) {
			console.error('Error creating note:', err);
			return false;
		}
	};

	const editNote = async (noteId, content) => {
		try {
			const updatedNote = await updateNote(noteId, content);
			setNotes(prev => prev.map(n => n._id === noteId ? updatedNote : n));
			return true;
		} catch (err) {
			console.error('Error editing note:', err);
			return false;
		}
	};

	const removeNote = async (noteId) => {
		try {
			await deleteNote(noteId);
			setNotes(prev => prev.filter(n => n._id !== noteId));
			return true;
		} catch (err) {
			console.error('Error removing note:', err);
			return false;
		}
	};

	return {
		notes,
		loading,
		error,
		createNote,
		editNote,
		removeNote,
		refreshNotes: loadNotes
	};
}
