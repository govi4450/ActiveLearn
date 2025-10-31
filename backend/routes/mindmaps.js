const express = require('express');
const mindmapController = require('../controllers/mindmapController');

const router = express.Router();

router.get('/generate', mindmapController.generateMindMap);

module.exports = router;
