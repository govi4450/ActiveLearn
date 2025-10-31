const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const User = require('../models/User');

// Get all notes for a video
router.get('/:username/:videoId', async (req, res) => {
	try {
		const { username, videoId } = req.params;
		const user = await User.findOne({ username });
		
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const notes = await Note.find({ userId: user._id, videoId })
			.sort({ timestamp: 1 });
		
		res.json(notes);
	} catch (error) {
		console.error('Error fetching notes:', error);
		res.status(500).json({ error: 'Failed to fetch notes' });
	}
});

// Get all notes for a user (across all videos)
router.get('/:username', async (req, res) => {
	try {
		const { username } = req.params;
		const user = await User.findOne({ username });
		
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const notes = await Note.find({ userId: user._id })
			.sort({ createdAt: -1 })
			.limit(50);
		
		res.json(notes);
	} catch (error) {
		console.error('Error fetching notes:', error);
		res.status(500).json({ error: 'Failed to fetch notes' });
	}
});

// Add a note
router.post('/', async (req, res) => {
	try {
		const { username, videoId, timestamp, content } = req.body;
		
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const note = new Note({
			userId: user._id,
			videoId,
			timestamp,
			content
		});

		await note.save();
		res.status(201).json(note);
	} catch (error) {
		console.error('Error adding note:', error);
		res.status(500).json({ error: 'Failed to add note' });
	}
});

// Update a note
router.put('/:noteId', async (req, res) => {
	try {
		const { noteId } = req.params;
		const { content } = req.body;

		const note = await Note.findByIdAndUpdate(
			noteId,
			{ content, updatedAt: Date.now() },
			{ new: true }
		);

		if (!note) {
			return res.status(404).json({ error: 'Note not found' });
		}

		res.json(note);
	} catch (error) {
		console.error('Error updating note:', error);
		res.status(500).json({ error: 'Failed to update note' });
	}
});

// Delete a note
router.delete('/:noteId', async (req, res) => {
	try {
		const { noteId } = req.params;
		
		await Note.findByIdAndDelete(noteId);
		res.json({ message: 'Note deleted' });
	} catch (error) {
		console.error('Error deleting note:', error);
		res.status(500).json({ error: 'Failed to delete note' });
	}
});

module.exports = router;
