const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	badgeId: {
		type: String,
		required: true
	},
	badgeName: {
		type: String,
		required: true
	},
	badgeIcon: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	unlockedAt: {
		type: Date,
		default: Date.now
	},
	category: {
		type: String,
		enum: ['videos', 'quizzes', 'streak', 'score', 'special'],
		required: true
	}
});

// Compound index to prevent duplicate achievements
achievementSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);
