const express = require('express');
const questionController = require('../controllers/questionController');

const router = express.Router();

router.get('/generate_questions', questionController.generateQuestions);
router.post('/save_response', questionController.saveResponse);
router.get('/progress', questionController.getProgress);
router.get('/quiz_score', questionController.getQuizScore);
router.post('/reset_progress', questionController.resetProgress);

module.exports = router;