const axios = require('axios');

// Lokdin Python API base URL
const LOKDIN_API_URL = process.env.LOKDIN_API_URL || 'http://localhost:5000';

class EngagementService {
  /**
   * Start engagement monitoring session
   */
  async startMonitoring(studentId, sessionName) {
    try {
      const response = await axios.post(`${LOKDIN_API_URL}/api/engagement/start`, {
        student_id: studentId,
        session_name: sessionName
      });
      return response.data;
    } catch (error) {
      console.error('Failed to start monitoring:', error.message);
      throw new Error('Failed to start engagement monitoring');
    }
  }

  /**
   * Stop engagement monitoring session
   */
  async stopMonitoring() {
    try {
      const response = await axios.post(`${LOKDIN_API_URL}/api/engagement/stop`);
      return response.data;
    } catch (error) {
      console.error('Failed to stop monitoring:', error.message);
      throw new Error('Failed to stop engagement monitoring');
    }
  }

  /**
   * Get current engagement metrics
   */
  async getCurrentMetrics() {
    try {
      const response = await axios.get(`${LOKDIN_API_URL}/api/engagement/metrics`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No active session
      }
      console.error('Failed to get metrics:', error.message);
      throw new Error('Failed to get engagement metrics');
    }
  }

  /**
   * Check if Lokdin service is running
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${LOKDIN_API_URL}/api/health`, { timeout: 3000 });
      return response.data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get video feed URL
   */
  getVideoFeedUrl() {
    return `${LOKDIN_API_URL}/video_feed`;
  }
}

module.exports = new EngagementService();
