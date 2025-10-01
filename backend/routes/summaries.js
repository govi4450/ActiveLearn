const express = require('express');
const summaryController = require('../controllers/summaryController');

const router = express.Router();

router.get('/summarize', summaryController.summarizeVideo);

module.exports = router;