import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './EngagementMonitor.css';

const API_BASE = 'http://localhost:5001/api/engagement';

function EngagementMonitor({ currentUser, currentVideo }) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [lokdinAvailable, setLokdinAvailable] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const intervalRef = useRef(null);

  // Check if Lokdin service is available
  useEffect(() => {
    checkLokdinHealth();
  }, []);

  // Fetch user's engagement history
  useEffect(() => {
    if (currentUser?.username) {
      fetchEngagementHistory();
    }
  }, [currentUser]);

  // Collect metrics periodically when monitoring
  useEffect(() => {
    if (isMonitoring && sessionId) {
      intervalRef.current = setInterval(async () => {
        try {
          const response = await axios.post(`${API_BASE}/collect/${sessionId}`);
          if (response.data.currentMetrics) {
            setCurrentMetrics(response.data.currentMetrics);
          }
        } catch (error) {
          console.error('Failed to collect metrics:', error);
        }
      }, 3000); // Collect every 3 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isMonitoring, sessionId]);

  const checkLokdinHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE}/health`);
      setLokdinAvailable(response.data.lokdinAvailable);
    } catch (error) {
      setLokdinAvailable(false);
    }
  };

  const fetchEngagementHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/history/${currentUser.username}?limit=5`);
      setSessionHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch engagement history:', error);
    }
  };

  const handleStartMonitoring = () => {
    setShowConsentModal(true);
  };

  const confirmStartMonitoring = async () => {
    try {
      const response = await axios.post(`${API_BASE}/start`, {
        username: currentUser.username,
        videoId: currentVideo?.id || 'general-learning',
        videoTitle: currentVideo?.title || 'Learning Session'
      });

      if (response.data.success) {
        setSessionId(response.data.sessionId);
        setIsMonitoring(true);
        setShowConsentModal(false);
        alert('Engagement monitoring started! Your camera will now track your learning focus.');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to start monitoring');
    }
  };

  const handleStopMonitoring = async () => {
    if (!sessionId) return;

    try {
      const response = await axios.post(`${API_BASE}/stop/${sessionId}`);
      
      setIsMonitoring(false);
      setSessionId(null);
      setCurrentMetrics(null);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Refresh history
      fetchEngagementHistory();

      alert(`Monitoring stopped! Average Engagement: ${(response.data.averageEngagement * 100).toFixed(1)}%`);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to stop monitoring');
    }
  };

  const getEngagementLevel = (score) => {
    if (!score) return 'Unknown';
    if (score > 0.7) return 'High';
    if (score > 0.4) return 'Medium';
    return 'Low';
  };

  const getEngagementColor = (score) => {
    if (!score) return '#gray';
    if (score > 0.7) return '#4caf50';
    if (score > 0.4) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="engagement-monitor">
      <div className="engagement-header">
        <h2>🎯 Engagement Monitoring</h2>
        {!lokdinAvailable && (
          <div className="warning-banner">
            ⚠️ Lokdin service is not available. Please start the engagement detection server.
          </div>
        )}
      </div>

      {/* Monitoring Controls */}
      <div className="monitoring-controls">
        {!isMonitoring ? (
          <button 
            className="btn-start-monitoring"
            onClick={handleStartMonitoring}
            disabled={!lokdinAvailable}
          >
            📹 Start Engagement Monitoring
          </button>
        ) : (
          <div className="monitoring-active">
            <div className="monitoring-status">
              <span className="status-indicator active"></span>
              <span>Monitoring Active</span>
            </div>
            <button 
              className="btn-stop-monitoring"
              onClick={handleStopMonitoring}
            >
              ⏹️ Stop Monitoring
            </button>
          </div>
        )}
      </div>

      {/* Current Metrics Display */}
      {isMonitoring && currentMetrics && (
        <div className="current-metrics">
          <h3>📊 Live Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Engagement Level</div>
              <div 
                className="metric-value"
                style={{ color: getEngagementColor(currentMetrics.engagement_score) }}
              >
                {getEngagementLevel(currentMetrics.engagement_score)}
              </div>
              <div className="metric-detail">
                {currentMetrics.engagement_score 
                  ? `${(currentMetrics.engagement_score * 100).toFixed(1)}%`
                  : 'N/A'}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Emotion</div>
              <div className="metric-value">{currentMetrics.emotion || 'Unknown'}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Eye Contact</div>
              <div className="metric-value">
                {currentMetrics.eye_contact_duration?.toFixed(1) || '0'}s
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Head Stability</div>
              <div className="metric-value">
                {currentMetrics.stability 
                  ? `${(currentMetrics.stability * 100).toFixed(0)}%`
                  : 'N/A'}
              </div>
            </div>
          </div>

          {/* Video Feed */}
          <div className="video-feed-container">
            <h4>📹 Live Feed</h4>
            <img 
              src={`http://localhost:5000/video_feed?t=${Date.now()}`}
              alt="Engagement Monitor Feed"
              className="video-feed"
            />
          </div>
        </div>
      )}

      {/* Engagement History */}
      <div className="engagement-history">
        <h3>📈 Past Sessions</h3>
        {sessionHistory.length === 0 ? (
          <p className="no-data">No engagement sessions yet. Start monitoring to see your history!</p>
        ) : (
          <div className="history-list">
            {sessionHistory.map((session) => (
              <div key={session._id} className="history-item">
                <div className="history-header">
                  <h4>{session.videoTitle}</h4>
                  <span className="history-date">
                    {new Date(session.startTime).toLocaleDateString()}
                  </span>
                </div>
                <div className="history-stats">
                  <div className="stat">
                    <span className="stat-label">Duration:</span>
                    <span className="stat-value">{Math.round(session.duration / 60)} min</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Avg Engagement:</span>
                    <span 
                      className="stat-value"
                      style={{ color: getEngagementColor(session.averageEngagement) }}
                    >
                      {session.averageEngagement 
                        ? `${(session.averageEngagement * 100).toFixed(1)}%`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Dominant Emotion:</span>
                    <span className="stat-value">{session.dominantEmotion || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Consent Modal */}
      {showConsentModal && (
        <div className="modal-overlay" onClick={() => setShowConsentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📹 Camera Access Consent</h3>
            <p>
              This feature uses your camera to monitor your engagement and focus during learning sessions.
            </p>
            <ul className="consent-list">
              <li>✓ Your video is processed locally and not stored</li>
              <li>✓ Only engagement metrics are saved (no video recording)</li>
              <li>✓ Data is used to provide personalized learning insights</li>
              <li>✓ You can stop monitoring at any time</li>
            </ul>
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowConsentModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm"
                onClick={confirmStartMonitoring}
              >
                I Accept - Start Monitoring
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EngagementMonitor;
