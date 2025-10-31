const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	videoId: {
		type: String,
		required: true
	},
	timestamp: {
		type: Number, // in seconds
		required: true
	},
	content: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
});

// Index for efficient querying
noteSchema.index({ userId: 1, videoId: 1 });

module.exports = mongoose.model('Note', noteSchema);
