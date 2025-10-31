const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
const User = require('../models/User');

// Get all bookmarks for a user
router.get('/:username', async (req, res) => {
	try {
		const { username } = req.params;
		const user = await User.findOne({ username });
		
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const bookmarks = await Bookmark.find({ userId: user._id })
			.sort({ createdAt: -1 });
		
		res.json(bookmarks);
	} catch (error) {
		console.error('Error fetching bookmarks:', error);
		res.status(500).json({ error: 'Failed to fetch bookmarks' });
	}
});

// Add a bookmark
router.post('/', async (req, res) => {
	try {
		const { username, videoId, videoTitle, videoThumbnail, tags, notes } = req.body;
		
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const bookmark = new Bookmark({
			userId: user._id,
			videoId,
			videoTitle,
			videoThumbnail,
			tags,
			notes
		});

		await bookmark.save();
		res.status(201).json(bookmark);
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({ error: 'Video already bookmarked' });
		}
		console.error('Error adding bookmark:', error);
		res.status(500).json({ error: 'Failed to add bookmark' });
	}
});

// Remove a bookmark
router.delete('/:username/:videoId', async (req, res) => {
	try {
		const { username, videoId } = req.params;
		
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		await Bookmark.findOneAndDelete({ userId: user._id, videoId });
		res.json({ message: 'Bookmark removed' });
	} catch (error) {
		console.error('Error removing bookmark:', error);
		res.status(500).json({ error: 'Failed to remove bookmark' });
	}
});

// Check if video is bookmarked
router.get('/check/:username/:videoId', async (req, res) => {
	try {
		const { username, videoId } = req.params;
		
		const user = await User.findOne({ username });
		if (!user) {
			return res.json({ bookmarked: false });
		}

		const bookmark = await Bookmark.findOne({ userId: user._id, videoId });
		res.json({ bookmarked: !!bookmark });
	} catch (error) {
		console.error('Error checking bookmark:', error);
		res.status(500).json({ error: 'Failed to check bookmark' });
	}
});

module.exports = router;
