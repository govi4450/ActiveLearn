const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const User = require('../models/User');

// Badge definitions
const BADGES = {
	FIRST_VIDEO: { id: 'first_video', name: 'First Steps', icon: '🎬', description: 'Watched your first video', category: 'videos' },
	VIDEO_5: { id: 'video_5', name: 'Explorer', icon: '🔍', description: 'Watched 5 videos', category: 'videos' },
	VIDEO_10: { id: 'video_10', name: 'Knowledge Seeker', icon: '📚', description: 'Watched 10 videos', category: 'videos' },
	VIDEO_25: { id: 'video_25', name: 'Learning Enthusiast', icon: '🌟', description: 'Watched 25 videos', category: 'videos' },
	VIDEO_50: { id: 'video_50', name: 'Master Learner', icon: '🏆', description: 'Watched 50 videos', category: 'videos' },
	
	FIRST_QUIZ: { id: 'first_quiz', name: 'Quiz Starter', icon: '📝', description: 'Completed your first quiz', category: 'quizzes' },
	QUIZ_10: { id: 'quiz_10', name: 'Quiz Master', icon: '🎓', description: 'Completed 10 quizzes', category: 'quizzes' },
	PERFECT_SCORE: { id: 'perfect_score', name: 'Perfect Score', icon: '💯', description: 'Scored 100% on a quiz', category: 'score' },
	HIGH_SCORER: { id: 'high_scorer', name: 'High Scorer', icon: '⭐', description: 'Average score above 80%', category: 'score' },
	
	STREAK_3: { id: 'streak_3', name: '3-Day Streak', icon: '🔥', description: 'Learned for 3 days in a row', category: 'streak' },
	STREAK_7: { id: 'streak_7', name: 'Week Warrior', icon: '💪', description: 'Learned for 7 days in a row', category: 'streak' },
	STREAK_30: { id: 'streak_30', name: 'Monthly Champion', icon: '👑', description: 'Learned for 30 days in a row', category: 'streak' },
	
	EARLY_BIRD: { id: 'early_bird', name: 'Early Bird', icon: '🌅', description: 'Joined the platform', category: 'special' }
};

// Get all achievements for a user
router.get('/:username', async (req, res) => {
	try {
		const { username } = req.params;
		const user = await User.findOne({ username });
		
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const achievements = await Achievement.find({ userId: user._id })
			.sort({ unlockedAt: -1 });
		
		res.json(achievements);
	} catch (error) {
		console.error('Error fetching achievements:', error);
		res.status(500).json({ error: 'Failed to fetch achievements' });
	}
});

// Unlock an achievement
router.post('/unlock', async (req, res) => {
	try {
		const { username, badgeId } = req.body;
		
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const badge = BADGES[badgeId.toUpperCase()];
		if (!badge) {
			return res.status(400).json({ error: 'Invalid badge ID' });
		}

		const achievement = new Achievement({
			userId: user._id,
			badgeId: badge.id,
			badgeName: badge.name,
			badgeIcon: badge.icon,
			description: badge.description,
			category: badge.category
		});

		await achievement.save();
		res.status(201).json(achievement);
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({ error: 'Achievement already unlocked' });
		}
		console.error('Error unlocking achievement:', error);
		res.status(500).json({ error: 'Failed to unlock achievement' });
	}
});

// Get available badges (all possible achievements)
router.get('/available/all', async (req, res) => {
	try {
		res.json(Object.values(BADGES));
	} catch (error) {
		console.error('Error fetching available badges:', error);
		res.status(500).json({ error: 'Failed to fetch badges' });
	}
});

module.exports = router;
