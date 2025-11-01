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
  const [selectedSession, setSelectedSession] = useState(null);
  const intervalRef = useRef(null);

  // Handle currentUser as string or object
  const username = typeof currentUser === 'string' ? currentUser : currentUser?.username;

  // Check if Lokdin service is available
  useEffect(() => {
    checkLokdinHealth();
  }, []);

  // Fetch user's engagement history
  useEffect(() => {
    if (username) {
      fetchEngagementHistory();
    }
  }, [username]);

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
      const response = await axios.get(`${API_BASE}/health`, { timeout: 3000 });
      setLokdinAvailable(response.data.lokdinAvailable);
    } catch (error) {
      setLokdinAvailable(false);
    }
  };

  const fetchEngagementHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/history/${username}?limit=10`);
      setSessionHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch engagement history:', error);
      setSessionHistory([]);
    }
  };

  const handleStartMonitoring = () => {
    if (!username) {
      alert('Please login to start engagement monitoring');
      return;
    }
    setShowConsentModal(true);
  };

  const confirmStartMonitoring = async () => {
    if (!username) {
      alert('Username is required');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/start`, {
        username: username,
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
      console.error('Start monitoring error:', error);
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
      await fetchEngagementHistory();

      const avgEngagement = response.data.averageEngagement || 0;
      alert(`Monitoring stopped! Average Engagement: ${(avgEngagement * 100).toFixed(1)}%`);
    } catch (error) {
      console.error('Stop monitoring error:', error);
      alert(error.response?.data?.error || 'Failed to stop monitoring');
    }
  };

  const getEngagementLevel = (score) => {
    if (!score && score !== 0) return 'Unknown';
    if (score > 0.7) return 'High';
    if (score > 0.4) return 'Medium';
    return 'Low';
  };

  const getEngagementColor = (score) => {
    if (!score && score !== 0) return '#gray';
    if (score > 0.7) return '#4caf50';
    if (score > 0.4) return '#ff9800';
    return '#f44336';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const calculateDistractionTime = (session) => {
    if (!session.engagementDistribution) return 0;
    const lowEngagement = session.engagementDistribution.low || 0;
    const totalMetrics = session.summary?.totalMetrics || 1;
    // Each metric is ~3 seconds apart
    return (lowEngagement * 3);
  };

  const viewSessionDetails = (session) => {
    setSelectedSession(session);
  };

  return (
    <div className="engagement-monitor">
      <div className="engagement-header">
        <h2>🎯 Engagement Monitoring</h2>
        {!username && (
          <div className="warning-banner">
            ⚠️ Please login to access engagement monitoring features.
          </div>
        )}
        {username && !lokdinAvailable && (
          <div className="warning-banner">
            ⚠️ Lokdin service is not available. Please start the engagement detection server.
          </div>
        )}
      </div>

      {/* Monitoring Controls */}
      {username && (
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
      )}

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
                {currentMetrics.engagement_score !== null && currentMetrics.engagement_score !== undefined
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
                  <h4>{session.videoTitle || 'Learning Session'}</h4>
                  <span className="history-date">
                    {formatDate(session.startTime)}
                  </span>
                </div>
                <div className="history-stats">
                  <div className="stat">
                    <span className="stat-label">Duration:</span>
                    <span className="stat-value">{formatDuration(session.duration)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Avg Engagement:</span>
                    <span 
                      className="stat-value"
                      style={{ color: getEngagementColor(session.averageEngagement) }}
                    >
                      {session.averageEngagement !== null && session.averageEngagement !== undefined
                        ? `${(session.averageEngagement * 100).toFixed(1)}%`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Distraction Time:</span>
                    <span className="stat-value stat-warning">
                      {formatDuration(calculateDistractionTime(session))}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Emotion:</span>
                    <span className="stat-value">{session.summary?.dominantEmotion || 'Unknown'}</span>
                  </div>
                </div>
                <button 
                  className="btn-view-details"
                  onClick={() => viewSessionDetails(session)}
                >
                  View Details →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="modal-overlay" onClick={() => setSelectedSession(null)}>
          <div className="modal-content session-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setSelectedSession(null)}>✕</button>
            <h3>📊 Session Details</h3>
            
            <div className="session-detail-header">
              <h4>{selectedSession.videoTitle || 'Learning Session'}</h4>
              <p className="session-date">{formatDate(selectedSession.startTime)}</p>
            </div>

            <div className="session-summary-grid">
              <div className="summary-card">
                <div className="summary-label">Total Duration</div>
                <div className="summary-value">{formatDuration(selectedSession.duration)}</div>
              </div>
              
              <div className="summary-card">
                <div className="summary-label">Average Engagement</div>
                <div 
                  className="summary-value"
                  style={{ color: getEngagementColor(selectedSession.averageEngagement) }}
                >
                  {selectedSession.averageEngagement 
                    ? `${(selectedSession.averageEngagement * 100).toFixed(1)}%`
                    : 'N/A'}
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-label">Distraction Time</div>
                <div className="summary-value summary-warning">
                  {formatDuration(calculateDistractionTime(selectedSession))}
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-label">Metrics Collected</div>
                <div className="summary-value">{selectedSession.summary?.totalMetrics || 0}</div>
              </div>
            </div>

            {/* Engagement Distribution */}
            {selectedSession.engagementDistribution && (
              <div className="distribution-section">
                <h5>Engagement Distribution</h5>
                <div className="distribution-bars">
                  <div className="bar-item">
                    <span className="bar-label">High Engagement</span>
                    <div className="bar-container">
                      <div 
                        className="bar bar-high"
                        style={{ 
                          width: `${(selectedSession.engagementDistribution.high / selectedSession.summary?.totalMetrics * 100) || 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="bar-value">{selectedSession.engagementDistribution.high || 0}</span>
                  </div>
                  
                  <div className="bar-item">
                    <span className="bar-label">Medium Engagement</span>
                    <div className="bar-container">
                      <div 
                        className="bar bar-medium"
                        style={{ 
                          width: `${(selectedSession.engagementDistribution.medium / selectedSession.summary?.totalMetrics * 100) || 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="bar-value">{selectedSession.engagementDistribution.medium || 0}</span>
                  </div>
                  
                  <div className="bar-item">
                    <span className="bar-label">Low Engagement (Distracted)</span>
                    <div className="bar-container">
                      <div 
                        className="bar bar-low"
                        style={{ 
                          width: `${(selectedSession.engagementDistribution.low / selectedSession.summary?.totalMetrics * 100) || 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="bar-value">{selectedSession.engagementDistribution.low || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Emotion Distribution */}
            {selectedSession.emotionDistribution && (
              <div className="distribution-section">
                <h5>Emotional State</h5>
                <div className="emotion-grid">
                  {Object.entries(selectedSession.emotionDistribution).map(([emotion, count]) => (
                    <div key={emotion} className="emotion-item">
                      <span className="emotion-name">{emotion}</span>
                      <span className="emotion-count">{count} times</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Head Pose Stats */}
            {selectedSession.summary?.averageHeadPose && (
              <div className="distribution-section">
                <h5>Average Head Position</h5>
                <div className="head-pose-stats">
                  <div className="pose-stat">
                    <span>Pitch:</span>
                    <span>{selectedSession.summary.averageHeadPose.pitch?.toFixed(1)}°</span>
                  </div>
                  <div className="pose-stat">
                    <span>Yaw:</span>
                    <span>{selectedSession.summary.averageHeadPose.yaw?.toFixed(1)}°</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
