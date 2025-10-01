const Video = require('../models/Video');
const TranscriptService = require('../services/transcriptService');
const GeminiService = require('../services/geminiService');

const summaryController = {
  async summarizeVideo(req, res) {
    try {
      const { video_id } = req.query;
      
      if (!video_id) {
        return res.status(400).json({ error: "Video ID is required" });
      }

      // Check if video summary already exists
      let video = await Video.findOne({ videoId: video_id });
      
      if (video && video.summary && video.summary.length > 0) {
        return res.json({
          success: true,
          summary: video.summary,
          cached: true
        });
      }

      // Get transcript and generate summary
      const transcriptText = await TranscriptService.getVideoTranscript(video_id);
      if (!transcriptText) {
        return res.status(404).json({ error: "No transcript available for this video" });
      }

      const summaryPoints = await GeminiService.generateSummary(transcriptText);

      // Save to database
      if (!video) {
        video = new Video({ videoId: video_id });
      }
      
      video.summary = summaryPoints.map(point => ({ text: point }));
      video.transcript = transcriptText;
      await video.save();

      res.json({
        success: true,
        summary: video.summary,
        cached: false
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        details: "Failed to summarize video"
      });
    }
  }
};

module.exports = summaryController;