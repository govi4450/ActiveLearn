import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || '/api';

export async function fetchMindMap(videoId) {
  const res = await axios.get(`${API_BASE}/mindmaps/generate`, { params: { video_id: videoId } });
  return res.data;
}
