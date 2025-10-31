const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	videoId: {
		type: String,
		required: true
	},
	videoTitle: {
		type: String,
		required: true
	},
	videoThumbnail: {
		type: String
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	tags: [{
		type: String
	}],
	notes: {
		type: String
	}
});

// Compound index to prevent duplicate bookmarks
bookmarkSchema.index({ userId: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
