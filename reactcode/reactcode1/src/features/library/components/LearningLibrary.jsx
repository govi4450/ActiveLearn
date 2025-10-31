import React, { useState } from 'react';
import { useTopicDocuments } from '../hooks/useTopicDocuments';
import Loading from '../../../components/Loading';

function LearningLibrary({ currentUser }) {
  const { topicDocuments, loading, error, generateSummary, deleteDocument } = useTopicDocuments(currentUser);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const handleTopicClick = (topicDoc) => {
    setSelectedTopic(topicDoc);
    setSummaryError(null);
  };

  const handleGenerateSummary = async (topic) => {
    setGeneratingSummary(true);
    setSummaryError(null);
    try {
      const updatedDoc = await generateSummary(topic);
      setSelectedTopic(updatedDoc);
    } catch (err) {
      setSummaryError('Failed to generate summary. Please try again.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleDeleteDocument = async (topic) => {
    if (window.confirm(`Are you sure you want to delete the document for "${topic}"?`)) {
      try {
        await deleteDocument(topic);
        if (selectedTopic?.normalizedTopic === topic.toLowerCase()) {
          setSelectedTopic(null);
        }
      } catch (err) {
        alert('Failed to delete document. Please try again.');
      }
    }
  };

  const handleClose = () => {
    setSelectedTopic(null);
    setSummaryError(null);
  };

  if (loading && topicDocuments.length === 0) {
    return <Loading message="Loading your learning library..." />;
  }

  return (
    <div className="learning-library-container">
      <div className="library-header">
        <h2>📚 Learning Library</h2>
        <p className="library-description">
          Your personalized knowledge base organized by topics. Each document contains comprehensive summaries from the last 3 videos watched per topic.
        </p>
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      {topicDocuments.length === 0 ? (
        <div className="empty-library">
          <div className="empty-library-icon">📖</div>
          <h3>Your Library is Empty</h3>
          <p>Start watching videos and your learning documents will appear here automatically!</p>
          <p className="empty-library-hint">
            Search for topics like "Machine Learning", "React", "Python" and watch videos to build your library.
          </p>
        </div>
      ) : (
        <div className="library-grid">
          {topicDocuments.map((topicDoc) => (
            <div
              key={topicDoc._id}
              className="topic-card"
              onClick={() => handleTopicClick(topicDoc)}
            >
              <div className="topic-card-header">
                <h3>{topicDoc.topic}</h3>
                <button
                  className="delete-topic-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDocument(topicDoc.normalizedTopic);
                  }}
                  title="Delete document"
                >
                  🗑️
                </button>
              </div>
              <div className="topic-card-stats">
                <span className="stat-item">
                  📹 {topicDoc.videosSummaries.length} videos tracked
                </span>
                <span className="stat-item">
                  📊 {topicDoc.totalVideosWatched} total watched
                </span>
              </div>
              <div className="topic-card-footer">
                <span className="last-accessed">
                  Last viewed: {new Date(topicDoc.lastAccessed).toLocaleDateString()}
                </span>
              </div>
              {topicDoc.consolidatedSummary?.lastUpdated && (
                <div className="summary-badge">✅ Summary Ready</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Topic Document Modal */}
      {selectedTopic && (
        <div className="topic-document-modal" onClick={handleClose}>
          <div className="topic-document-content" onClick={(e) => e.stopPropagation()}>
            <div className="document-header">
              <h2>📄 {selectedTopic.topic}</h2>
              <button className="close-btn" onClick={handleClose}>✕</button>
            </div>

            <div className="document-body">
              {/* Video List */}
              <div className="document-section">
                <h3>📹 Recent Videos ({selectedTopic.videosSummaries.length})</h3>
                <div className="videos-list">
                  {selectedTopic.videosSummaries.map((video, index) => (
                    <div key={video.videoId} className="video-summary-item">
                      <div className="video-number">{index + 1}</div>
                      <div className="video-info">
                        <h4>{video.videoTitle}</h4>
                        <div className="video-keywords">
                          {video.keywords.map((keyword, i) => (
                            <span key={i} className="keyword-tag">{keyword}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consolidated Summary Section */}
              <div className="document-section">
                <div className="section-header">
                  <h3>📚 Consolidated Learning Summary</h3>
                  {!selectedTopic.consolidatedSummary?.lastUpdated && (
                    <button
                      className="generate-summary-btn"
                      onClick={() => handleGenerateSummary(selectedTopic.normalizedTopic)}
                      disabled={generatingSummary}
                    >
                      {generatingSummary ? '⏳ Generating...' : '✨ Generate Summary'}
                    </button>
                  )}
                  {selectedTopic.consolidatedSummary?.lastUpdated && (
                    <button
                      className="regenerate-summary-btn"
                      onClick={() => handleGenerateSummary(selectedTopic.normalizedTopic)}
                      disabled={generatingSummary}
                    >
                      {generatingSummary ? '⏳ Regenerating...' : '🔄 Regenerate'}
                    </button>
                  )}
                </div>

                {summaryError && (
                  <div className="summary-error">⚠️ {summaryError}</div>
                )}

                {selectedTopic.consolidatedSummary?.lastUpdated ? (
                  <div className="consolidated-summary">
                    <div className="summary-updated">
                      Last updated: {new Date(selectedTopic.consolidatedSummary.lastUpdated).toLocaleString()}
                    </div>

                    {/* Main Concepts */}
                    {selectedTopic.consolidatedSummary.mainConcepts?.length > 0 && (
                      <div className="summary-subsection">
                        <h4>🎯 Main Concepts</h4>
                        <ul className="concepts-list">
                          {selectedTopic.consolidatedSummary.mainConcepts.map((concept, index) => (
                            <li key={index}>{concept}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Detailed Points */}
                    {selectedTopic.consolidatedSummary.detailedPoints?.length > 0 && (
                      <div className="summary-subsection">
                        <h4>📖 Detailed Explanation</h4>
                        <ul className="detailed-points-list">
                          {selectedTopic.consolidatedSummary.detailedPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Related Topics */}
                    {selectedTopic.consolidatedSummary.relatedTopics?.length > 0 && (
                      <div className="summary-subsection">
                        <h4>🔗 Related Topics</h4>
                        <div className="related-topics">
                          {selectedTopic.consolidatedSummary.relatedTopics.map((topic, index) => (
                            <span key={index} className="related-topic-tag">{topic}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-summary">
                    <p>📝 No consolidated summary generated yet.</p>
                    <p>Click "Generate Summary" to create a comprehensive learning document combining insights from all {selectedTopic.videosSummaries.length} videos.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LearningLibrary;
