const Question = require('../models/Question');
const Progress = require('../models/Progress');
const User = require('../models/User');
const TranscriptService = require('../services/transcriptService');
const GeminiService = require('../services/geminiService');
const { parseGeminiResponse } = require('../utils/parsers');

const questionController = {
  async generateQuestions(req, res) {
    try {
      const { video_id, username } = req.query;
      
      if (!video_id) {
        return res.status(400).json({ error: "Video ID is required" });
      }

      // Check if questions already exist
      const existingQuestions = await Question.find({ videoId: video_id });
      if (existingQuestions.length > 0) {
        return res.json({
          success: true,
          questions: existingQuestions,
          cached: true
        });
      }

      // Get transcript and generate questions
      const transcriptText = await TranscriptService.getVideoTranscript(video_id);
      if (!transcriptText) {
        return res.status(404).json({ error: "No transcript available for this video" });
      }

      console.log("🤖 Generating questions with Gemini...");
      const geminiResponse = await GeminiService.generateQuestions(transcriptText);
      console.log("📋 Parsing Gemini response...");
      const questionsData = parseGeminiResponse(geminiResponse);

      if (!questionsData || questionsData.length === 0) {
        throw new Error("No questions could be generated from the transcript");
      }

      // Save questions to database
      const questions = await Question.insertMany(
        questionsData.map((q, index) => ({
          videoId: video_id,
          question: q.question,
          type: q.type,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty || 'Medium',
          order: index + 1
        }))
      );

      // Create progress tracking if user is logged in
      if (username) {
        const user = await User.findOne({ username });
        if (user) {
          await Progress.findOneAndUpdate(
            { userId: user._id, videoId: video_id },
            { 
              userId: user._id, 
              videoId: video_id,
              $setOnInsert: { 
                responses: [], 
                score: { correct: 0, total: 0, percentage: 0 } 
              }
            },
            { upsert: true, new: true }
          );
        }
      }

      console.log(`✅ Generated ${questions.length} questions for video ${video_id}`);
      
      res.json({
        success: true,
        questions,
        cached: false,
        count: questions.length
      });
    } catch (error) {
      console.error('❌ Question generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        details: "Failed to generate questions"
      });
    }
  },

  async saveResponse(req, res) {
    try {
      const { video_id, question_id, user_answer, username } = req.body;
      
      if (!username || !video_id || !question_id || typeof user_answer === 'undefined') {
        return res.status(400).json({ error: "Missing required fields: username, video_id, question_id, user_answer" });
      }

      // Get user
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get the question to check correctness
      const question = await Question.findOne({ 
        $or: [
          { _id: question_id },
          { id: question_id }
        ]
      });
      
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }

      const isCorrect = this.checkAnswerCorrectness(user_answer, question.correctAnswer);

      // Find or create progress record
      let progress = await Progress.findOne({ userId: user._id, videoId: video_id });
      if (!progress) {
        progress = new Progress({
          userId: user._id,
          videoId: video_id,
          responses: [],
          score: { correct: 0, total: 0, percentage: 0 }
        });
      }

      // Check if response already exists for this question
      const existingResponseIndex = progress.responses.findIndex(
        r => r.questionId.toString() === question._id.toString()
      );

      if (existingResponseIndex !== -1) {
        // Update existing response
        progress.responses[existingResponseIndex] = {
          questionId: question._id,
          userAnswer: user_answer,
          isCorrect,
          timestamp: new Date()
        };
      } else {
        // Add new response
        progress.responses.push({
          questionId: question._id,
          userAnswer: user_answer,
          isCorrect,
          timestamp: new Date()
        });
      }

      // Update score
      const correctCount = progress.responses.filter(r => r.isCorrect).length;
      const totalQuestions = progress.responses.length;
      progress.score = {
        correct: correctCount,
        total: totalQuestions,
        percentage: totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
      };

      // Mark as completed if all questions are answered (assuming we know total questions)
      const totalQuestionsForVideo = await Question.countDocuments({ videoId: video_id });
      progress.completed = progress.responses.length >= totalQuestionsForVideo;

      progress.lastAccessed = new Date();
      await progress.save();

      console.log(`✅ Saved response for user ${username}, question ${question_id}, correct: ${isCorrect}`);

      res.json({ 
        success: true,
        isCorrect,
        explanation: question.explanation,
        correctAnswer: question.correctAnswer,
        score: progress.score
      });
    } catch (error) {
      console.error('❌ Save response error:', error);
      res.status(500).json({ 
        error: error.message,
        details: "Failed to save response" 
      });
    }
  },

  async getProgress(req, res) {
    try {
      const { video_id, username } = req.query;
      
      if (!username || !video_id) {
        return res.status(400).json({ error: "Username and video ID are required" });
      }

      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const progress = await Progress.findOne({ userId: user._id, videoId: video_id })
        .populate('responses.questionId');

      if (!progress) {
        return res.json({
          success: true,
          progress: {
            score: { correct: 0, total: 0, percentage: 0 },
            responses: [],
            completed: false,
            videoId: video_id
          },
          message: "No progress found for this video"
        });
      }

      // Get all questions for this video to show total count
      const totalQuestions = await Question.countDocuments({ videoId: video_id });

      res.json({
        success: true,
        progress: {
          score: progress.score,
          responses: progress.responses,
          completed: progress.completed,
          videoId: progress.videoId,
          totalQuestions: totalQuestions,
          answered: progress.responses.length,
          lastAccessed: progress.lastAccessed
        }
      });
    } catch (error) {
      console.error('❌ Get progress error:', error);
      res.status(500).json({ 
        error: error.message,
        details: "Failed to get progress" 
      });
    }
  },

  async getQuizScore(req, res) {
    try {
      const { video_id, username } = req.query;
      
      if (!username || !video_id) {
        return res.status(400).json({ error: "Username and video ID are required" });
      }

      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const progress = await Progress.findOne({ userId: user._id, videoId: video_id });
      
      if (!progress) {
        return res.json({
          success: true,
          score: { correct: 0, total: 0, percentage: 0 },
          answered: 0,
          completed: false
        });
      }

      res.json({
        success: true,
        score: progress.score,
        answered: progress.responses.length,
        completed: progress.completed,
        lastAccessed: progress.lastAccessed
      });
    } catch (error) {
      console.error('❌ Get quiz score error:', error);
      res.status(500).json({ 
        error: error.message,
        details: "Failed to get quiz score" 
      });
    }
  },

  async resetProgress(req, res) {
    try {
      const { video_id, username } = req.body;
      
      if (!username || !video_id) {
        return res.status(400).json({ error: "Username and video ID are required" });
      }

      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await Progress.findOneAndDelete({ userId: user._id, videoId: video_id });

      console.log(`🔄 Reset progress for user ${username}, video ${video_id}`);

      res.json({
        success: true,
        message: "Progress reset successfully"
      });
    } catch (error) {
      console.error('❌ Reset progress error:', error);
      res.status(500).json({ 
        error: error.message,
        details: "Failed to reset progress" 
      });
    }
  },

  checkAnswerCorrectness(userAnswer, correctAnswer) {
    if (!userAnswer || !correctAnswer) return false;

    const normalize = (str) => {
      if (!str) return '';
      return str.toString()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\b(a|an|the)\b/g, '')
        .trim();
    };

    const normalizedUser = normalize(userAnswer);
    const normalizedCorrect = normalize(correctAnswer);

    if (!normalizedUser || !normalizedCorrect) return false;

    // Exact match
    if (normalizedUser === normalizedCorrect) return true;

    // Remove common prefixes from answer (like "a)", "b)", etc.)
    const cleanUser = normalizedUser.replace(/^[a-z]\)\s*/, '');
    const cleanCorrect = normalizedCorrect.replace(/^[a-z]\)\s*/, '');

    if (cleanUser === cleanCorrect) return true;

    // Partial match (contains)
    if (cleanUser.includes(cleanCorrect) || cleanCorrect.includes(cleanUser)) return true;

    // Special cases for true/false
    const trueVariants = ["true", "correct", "yes", "right", "t"];
    const falseVariants = ["false", "incorrect", "no", "wrong", "f"];

    if (trueVariants.includes(cleanUser) && trueVariants.includes(cleanCorrect)) return true;
    if (falseVariants.includes(cleanUser) && falseVariants.includes(cleanCorrect)) return true;

    // For multiple choice, check if user selected the correct option letter
    if (normalizedUser.length === 1 && normalizedCorrect.length > 1) {
      const optionLetters = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
      if (optionLetters[normalizedUser] !== undefined) {
        // This would require knowing the options array, so we'll keep it simple
        return false;
      }
    }

    return false;
  }
};

module.exports = questionController;