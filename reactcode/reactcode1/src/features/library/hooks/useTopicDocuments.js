import { useState, useEffect, useCallback } from 'react';
import * as topicDocumentService from '../services/topicDocumentService';

export const useTopicDocuments = (username) => {
  const [topicDocuments, setTopicDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTopicDocuments = useCallback(async () => {
    if (!username) {
      console.warn('No username provided to fetchTopicDocuments');
      return;
    }
    
    console.log(`[useTopicDocuments] Fetching documents for user: ${username}`);
    setLoading(true);
    setError(null);
    
    try {
      const documents = await topicDocumentService.getUserLibrary(username);
      console.log(`[useTopicDocuments] Received ${documents.length} documents`);
      setTopicDocuments(documents);
    } catch (err) {
      console.error('[useTopicDocuments] Error fetching documents:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load library';
      setError(errorMessage);
      
      // If 404, set empty array instead of showing error
      if (err.response?.status === 404) {
        console.log('[useTopicDocuments] No documents found (404), initializing empty library');
        setTopicDocuments([]);
      }
    } finally {
      setLoading(false);
    }
  }, [username]);

  const trackVideo = useCallback(async (videoId, videoTitle, topic, keywords) => {
    if (!username) return;
    try {
      await topicDocumentService.trackVideoWatch(username, videoId, videoTitle, topic, keywords);
      // Refresh the list after tracking
      await fetchTopicDocuments();
    } catch (err) {
      console.error('Error tracking video:', err);
      throw err;
    }
  }, [username, fetchTopicDocuments]);

  const generateSummary = useCallback(async (topic) => {
    if (!username) return;
    setLoading(true);
    setError(null);
    try {
      const data = await topicDocumentService.generateConsolidatedSummary(username, topic);
      // Refresh the list after generating summary
      await fetchTopicDocuments();
      return data.topicDocument;
    } catch (err) {
      const errorMessage = err.error || err.message || 'Failed to generate summary';
      setError(errorMessage);
      console.error('Error generating summary:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [username, fetchTopicDocuments]);

  const deleteDocument = useCallback(async (topic) => {
    if (!username) return;
    setLoading(true);
    setError(null);
    try {
      // First, get the topic document to get its ID
      const response = await topicDocumentService.getAllTopicDocuments(username);
      const topicDoc = response.topicDocuments?.find(doc => 
        doc.normalizedTopic === topic.toLowerCase()
      );
      
      if (topicDoc) {
        await topicDocumentService.deleteTopicDocument(topicDoc._id);
        // Refresh the list after deletion
        await fetchTopicDocuments();
      } else {
        throw new Error('Topic document not found');
      }
    } catch (err) {
      const errorMessage = err.error || err.message || 'Failed to delete document';
      setError(errorMessage);
      console.error('Error deleting document:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [username, fetchTopicDocuments]);

  useEffect(() => {
    fetchTopicDocuments();
  }, [fetchTopicDocuments]);

  return {
    topicDocuments,
    loading,
    error,
    fetchTopicDocuments,
    trackVideo,
    generateSummary,
    deleteDocument
  };
};
