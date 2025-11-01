import axios from 'axios';

// Base API configuration - use relative paths that work with proxy
const API_BASE = '/api/topic-documents';
const LIBRARY_BASE = '/api/library';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Add request interceptor for logging
axios.interceptors.request.use(request => {
  console.log('Starting Request', JSON.stringify(request, null, 2));
  return request;
});

// Add response interceptor for error handling
axios.interceptors.response.use(
  response => {
    console.log('Response:', response.config.url, response.status, response.data);
    return response;
  },
  error => {
    console.error('API Error:', error.config?.url, error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// Track a watched video for a specific topic
export const trackVideoWatch = async (username, videoId, videoTitle, topic, keywords) => {
  try {
    const response = await axios.post(
      `${API_BASE}/track`,
      { username, videoId, videoTitle, topic, keywords },
      { withCredentials: true } // Include cookies for authentication
    );
    return response.data;
  } catch (error) {
    console.error('Error tracking video watch:', error);
    throw error.response?.data || { error: 'Failed to track video watch' };
  }
};

// Generate a consolidated summary for a topic
export const generateConsolidatedSummary = async (username, topic) => {
  try {
    const response = await axios.post(
      `${LIBRARY_BASE}/summarize/${encodeURIComponent(topic)}`,
      { username },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error generating consolidated summary:', error);
    throw error.response?.data || { error: 'Failed to generate summary' };
  }
};

// Get all topic documents for a user
// If username is provided, it will be used to fetch documents for that specific user
export const getAllTopicDocuments = async (username) => {
  try {
    const response = await axios.post(
      API_BASE,
      { username },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching topic documents:', error);
    throw error.response?.data || { error: 'Failed to fetch topic documents' };
  }
};

// Get a specific topic document by ID
export const getTopicDocument = async (id) => {
  try {
    const response = await axios.get(
      `${LIBRARY_BASE}/topic/${id}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching topic document:', error);
    throw error.response?.data || { error: 'Failed to fetch topic document' };
  }
};

// Delete a topic document by ID
export const deleteTopicDocument = async (id) => {
  try {
    const response = await axios.delete(
      `${API_BASE}/${id}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting topic document:', error);
    throw error.response?.data || { error: 'Failed to delete topic document' };
  }
};

// Update summary manually
export const updateSummary = async (id, mainConcepts, detailedPoints, relatedTopics) => {
  try {
    const response = await axios.put(
      `${LIBRARY_BASE}/update-summary/${id}`,
      { mainConcepts, detailedPoints, relatedTopics },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating summary:', error);
    throw error.response?.data || { error: 'Failed to update summary' };
  }
};

// Get user's library (consolidated view of all topics)
export const getUserLibrary = async (username) => {
  if (!username) {
    console.error('No username provided to getUserLibrary');
    return [];
  }
  
  try {
    // Encode the username to handle spaces and special characters
    const encodedUsername = encodeURIComponent(username);
    console.log(`[getUserLibrary] Fetching library for user: ${username} (encoded: ${encodedUsername})`);
    
    const response = await axios.get(`${LIBRARY_BASE}/user/${encodedUsername}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    });
    
    console.log('[getUserLibrary] Response:', response);
    
    // Handle both response formats for backward compatibility
    const data = response.data;
    const documents = Array.isArray(data) ? data : (data?.topicDocuments || data || []);
    
    console.log(`[getUserLibrary] Retrieved ${documents.length} documents`);
    return documents;
  } catch (error) {
    console.error('Error fetching user library:', error);
    // If 404, return empty array instead of error
    if (error.response?.status === 404) {
      return [];
    }
    throw error.response?.data || { error: 'Failed to fetch user library' };
  }
};
