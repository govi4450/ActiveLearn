const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	type: {
		type: String,
		enum: ['daily', 'weekly', 'monthly', 'custom'],
		required: true
	},
	target: {
		type: Number, // e.g., 5 videos, 3 quizzes
		required: true
	},
	current: {
		type: Number,
		default: 0
	},
	metric: {
		type: String,
		enum: ['videos', 'quizzes', 'study_time', 'score'],
		required: true
	},
	startDate: {
		type: Date,
		default: Date.now
	},
	endDate: {
		type: Date,
		required: true
	},
	completed: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

// Index for efficient querying
goalSchema.index({ userId: 1, completed: 1 });

module.exports = mongoose.model('Goal', goalSchema);
