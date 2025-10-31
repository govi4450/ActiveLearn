const express = require('express');
const questionController = require('../controllers/questionController');

const router = express.Router();

router.get('/generate_questions', questionController.generateQuestions);
router.post('/save_response', questionController.saveResponse);
router.get('/progress', questionController.getProgress); // Returns score, responses, completed status
router.post('/reset_progress', questionController.resetProgress);
router.post('/mark_completed', questionController.markCompleted);

module.exports = router;