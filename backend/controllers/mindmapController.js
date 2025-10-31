const Video = require('../models/Video');
const TranscriptService = require('../services/transcriptService');
const GeminiService = require('../services/geminiService');

const mindmapController = {
  async generateMindMap(req, res) {
    try {
      const { video_id } = req.query;
      if (!video_id) return res.status(400).json({ error: 'video_id is required' });

      // Check cache
      let video = await Video.findOne({ videoId: video_id });
      if (video && video.mindmap) {
        return res.json({ success: true, mindmap: video.mindmap, cached: true });
      }

      // Get transcript
      const transcriptText = await TranscriptService.getVideoTranscript(video_id);
      if (!transcriptText) return res.status(404).json({ error: 'Transcript not found' });

      const mindmap = await GeminiService.generateMindMap(transcriptText);

      if (!video) video = new Video({ videoId: video_id });
      video.mindmap = mindmap;
      await video.save();

      res.json({ success: true, mindmap, cached: false });
    } catch (err) {
      console.error('Mindmap generation error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
};

module.exports = mindmapController;
