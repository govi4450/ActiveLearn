const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['mcq', 'true_false', 'short_answer'],
    required: true
  },
  options: [String],
  correctAnswer: {
    type: String,
    required: true
  },
  explanation: String,
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  timestamp: Number
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);