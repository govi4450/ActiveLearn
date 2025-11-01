import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './LiveEngagementWidget.css';

const API_BASE = 'http://localhost:5001/api/engagement';

/**
 * Floating widget that shows real-time engagement metrics during video playback
 * Displays emotions, engagement level, and distractions in the background
 */
function LiveEngagementWidget({ currentUser, isVisible = true }) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const intervalRef = useRef(null);

  // Check for active session on mount
  useEffect(() => {
    checkActiveSession();
  }, [currentUser]);

  // Poll for metrics when monitoring
  useEffect(() => {
    if (isMonitoring && sessionId) {
      fetchMetrics();
      intervalRef.current = setInterval(fetchMetrics, 3000); // Every 3 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isMonitoring, sessionId]);

  const checkActiveSession = async () => {
    // Get username - handle both string and object types
    const username = typeof currentUser === 'string' 
      ? currentUser 
      : (currentUser?.username || currentUser?.name || currentUser?.email);
    if (!username) return;

    try {
      // Check if there's an active session
      const response = await axios.get(`${API_BASE}/history/${username}?limit=1`, {
        timeout: 3000
      });
      const sessions = response.data;
      
      if (sessions.length > 0 && sessions[0].isActive) {
        setSessionId(sessions[0]._id);
        setIsMonitoring(true);
      }
    } catch (error) {
      // Silently fail if backend is not available
      // This is expected when services aren't running
      console.log('Engagement service not available:', error.message);
    }
  };

  const fetchMetrics = async () => {
    if (!sessionId) return;

    try {
      const response = await axios.post(`${API_BASE}/collect/${sessionId}`, {}, {
        timeout: 5000
      });
      if (response.data.currentMetrics) {
        setMetrics(response.data.currentMetrics);
      }
    } catch (error) {
      // Silently fail - service might be temporarily unavailable
      console.log('Could not fetch metrics:', error.message);
    }
  };

  const handleStartMonitoring = () => {
    setShowConsent(true);
  };

  const confirmStartMonitoring = async () => {
    // Get username - handle both string and object types
    const username = typeof currentUser === 'string' 
      ? currentUser 
      : (currentUser?.username || currentUser?.name || currentUser?.email);
    
    // Validate currentUser
    if (!username) {
      alert('Please login first to use engagement monitoring.');
      setShowConsent(false);
      return;
    }

    try {
      console.log('Starting monitoring for user:', username, 'Full currentUser:', currentUser, 'type:', typeof currentUser);
      
      const response = await axios.post(`${API_BASE}/start`, {
        username: username,
        videoId: 'learning-session',
        videoTitle: 'Learning Session'
      }, {
        timeout: 5000
      });

      console.log('Start monitoring response:', response.data);

      if (response.data.success) {
        setSessionId(response.data.sessionId);
        setIsMonitoring(true);
        setShowConsent(false);
      }
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      const errorMsg = error.code === 'ECONNABORTED' || error.message.includes('timeout')
        ? 'Backend service is not running. Please start the servers first.'
        : error.response?.data?.error || 'Failed to start monitoring. Make sure backend is running.';
      alert(errorMsg);
      setShowConsent(false);
    }
  };

  const handleStopMonitoring = async () => {
    if (!sessionId) return;

    try {
      await axios.post(`${API_BASE}/stop/${sessionId}`, {}, {
        timeout: 5000
      });
      setIsMonitoring(false);
      setSessionId(null);
      setMetrics(null);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
      // Stop locally even if backend call fails
      setIsMonitoring(false);
      setSessionId(null);
      setMetrics(null);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const getEngagementColor = (score) => {
    if (!score) return '#999';
    if (score > 0.7) return '#4caf50';
    if (score > 0.4) return '#ff9800';
    return '#f44336';
  };

  const getEngagementEmoji = (score) => {
    if (!score) return '😐';
    if (score > 0.7) return '🎯';
    if (score > 0.4) return '😊';
    return '😴';
  };

  const getEmotionEmoji = (emotion) => {
    const emotionMap = {
      'happy': '😊',
      'sad': '😢',
      'angry': '😠',
      'fear': '😨',
      'surprise': '😲',
      'neutral': '😐',
      'disgust': '🤢'
    };
    return emotionMap[emotion?.toLowerCase()] || '😐';
  };

  // Don't show widget if not visible or user not logged in
  if (!isVisible) return null;
  
  // Debug: Check what currentUser contains
  console.log('LiveEngagementWidget - currentUser:', currentUser, 'type:', typeof currentUser);
  
  // Show widget but require login for functionality
  // Handle both cases: currentUser as string (just username) or as object
  const isUserLoggedIn = currentUser && (
    typeof currentUser === 'string' ? currentUser : 
    (currentUser.username || currentUser.name || currentUser.email)
  );

  return (
    <>
      <div className={`live-engagement-widget ${isMinimized ? 'minimized' : ''}`}>
        {!isMonitoring ? (
          /* Not Monitoring - Show Start Button */
          <div className="widget-inactive">
            <button 
              className="btn-widget-start"
              onClick={handleStartMonitoring}
              disabled={!isUserLoggedIn}
              title={!isUserLoggedIn ? 'Please login first' : 'Start engagement monitoring'}
            >
              <span className="icon">📹</span>
              <span className="text">
                {!isUserLoggedIn ? 'Login to Monitor' : 'Start Monitoring'}
              </span>
            </button>
          </div>
        ) : (
          /* Monitoring Active */
          <div className="widget-active">
            <div className="widget-header">
              <div className="status-badge">
                <span className="pulse-dot"></span>
                Live Monitoring
              </div>
              <div className="widget-actions">
                <button 
                  className="btn-icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? '📊' : '➖'}
                </button>
                <button 
                  className="btn-icon btn-stop"
                  onClick={handleStopMonitoring}
                  title="Stop Monitoring"
                >
                  ⏹️
                </button>
              </div>
            </div>

            {!isMinimized && metrics && (
              <div className="widget-content">
                {/* Engagement Score */}
                <div className="metric-row engagement-row">
                  <div className="metric-icon">
                    {getEngagementEmoji(metrics.engagement_score)}
                  </div>
                  <div className="metric-details">
                    <div className="metric-label">Engagement</div>
                    <div 
                      className="metric-value"
                      style={{ color: getEngagementColor(metrics.engagement_score) }}
                    >
                      {metrics.engagement_score 
                        ? `${(metrics.engagement_score * 100).toFixed(0)}%`
                        : 'Detecting...'}
                    </div>
                  </div>
                </div>

                {/* Emotion */}
                <div className="metric-row">
                  <div className="metric-icon">
                    {getEmotionEmoji(metrics.emotion)}
                  </div>
                  <div className="metric-details">
                    <div className="metric-label">Emotion</div>
                    <div className="metric-value emotion-value">
                      {metrics.emotion || 'Detecting...'}
                    </div>
                  </div>
                </div>

                {/* Focus Indicator */}
                <div className="metric-row">
                  <div className="metric-icon">👁️</div>
                  <div className="metric-details">
                    <div className="metric-label">Eye Contact</div>
                    <div className="metric-value">
                      {metrics.eye_contact_duration?.toFixed(1) || '0'}s
                    </div>
                  </div>
                </div>

                {/* Stability */}
                {metrics.stability !== undefined && (
                  <div className="metric-row">
                    <div className="metric-icon">🎯</div>
                    <div className="metric-details">
                      <div className="metric-label">Stability</div>
                      <div className="metric-value">
                        {(metrics.stability * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                )}

                {/* Distraction Alert */}
                {metrics.engagement_score && metrics.engagement_score < 0.4 && (
                  <div className="distraction-alert">
                    ⚠️ Low engagement detected!
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Consent Modal */}
      {showConsent && (
        <div className="widget-modal-overlay" onClick={() => setShowConsent(false)}>
          <div className="widget-modal" onClick={(e) => e.stopPropagation()}>
            <h3>📹 Enable Background Monitoring?</h3>
            <p>
              Monitor your engagement, emotions, and focus in real-time while you learn.
            </p>
            <ul className="consent-points">
              <li>✓ Runs in background while watching videos</li>
              <li>✓ Real-time feedback on your focus</li>
              <li>✓ Distraction alerts to help you stay on track</li>
              <li>✓ Session reports saved to dashboard</li>
              <li>✓ No video recording - only metrics</li>
            </ul>
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowConsent(false)}
              >
                Not Now
              </button>
              <button 
                className="btn-accept"
                onClick={confirmStartMonitoring}
              >
                Enable Monitoring
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LiveEngagementWidget;
