const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const User = require('../models/User');

// Get dashboard analytics for a user
router.get('/analytics/:username', async (req, res) => {
	try {
		const { username } = req.params;
		
		// Find user
		const user = await User.findOne({ username });
		if (!user) {
			return res.json({
				totalVideos: 0,
				totalQuizzes: 0,
				averageScore: 0,
				practiceCount: 0,
				studyStreak: 0,
				totalStudyTime: 0
			});
		}

		// Get all progress records for this user
		const progressRecords = await Progress.find({ userId: user._id });

		// Calculate analytics
		const totalVideos = new Set(progressRecords.map(p => p.videoId)).size;
		const totalQuizzes = progressRecords.filter(p => p.completed).length;
		
		// Calculate average score
		const completedRecords = progressRecords.filter(p => p.score && p.score.percentage !== undefined);
		const averageScore = completedRecords.length > 0
			? Math.round(completedRecords.reduce((sum, p) => sum + p.score.percentage, 0) / completedRecords.length)
			: 0;

		// Count practice sessions (records without completion)
		const practiceCount = progressRecords.filter(p => !p.completed).length;

		// Calculate study streak (simplified - days with activity)
		const uniqueDays = new Set(
			progressRecords.map(p => new Date(p.lastAccessed).toDateString())
		).size;

		// Estimate study time (5 minutes per video)
		const totalStudyTime = Math.round((totalVideos * 5) / 60); // in hours

		res.json({
			totalVideos,
			totalQuizzes,
			averageScore,
			practiceCount,
			studyStreak: uniqueDays,
			totalStudyTime
		});
	} catch (error) {
		console.error('Error fetching analytics:', error);
		res.status(500).json({ error: 'Failed to fetch analytics' });
	}
});

// Get recent activity for a user
router.get('/activity/:username', async (req, res) => {
	try {
		const { username } = req.params;
		
		// Find user
		const user = await User.findOne({ username });
		if (!user) {
			return res.json([]);
		}

		// Get recent progress records
		const progressRecords = await Progress.find({ userId: user._id })
			.sort({ lastAccessed: -1 })
			.limit(10)
			.populate('responses.questionId');

		// Format activity data
		const activities = progressRecords.map(record => {
			const activityType = record.completed ? 'quiz' : 'practice';
			const score = record.score ? record.score.percentage : null;

			return {
				type: 'video',
				activityType: activityType,
				title: record.videoTitle || `Video ${record.videoId.substring(0, 11)}`,
				description: activityType === 'quiz' ? `Quiz completed - Score: ${score}%` : 'Practice session',
				score: score,
				timestamp: record.lastAccessed,
				videoId: record.videoId,
				videoThumbnail: record.videoThumbnail || `https://img.youtube.com/vi/${record.videoId}/mqdefault.jpg`
			};
		});

		res.json(activities);
	} catch (error) {
		console.error('Error fetching activity:', error);
		res.status(500).json({ error: 'Failed to fetch activity' });
	}
});

module.exports = router;
