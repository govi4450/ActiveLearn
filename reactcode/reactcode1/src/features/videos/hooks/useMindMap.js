import { useState } from 'react';
import { fetchMindMap } from '../services/mindmapService';

export function useMindMap() {
  const [mindmap, setMindmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMindMap = async (videoId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMindMap(videoId);
      if (res && res.success) {
        setMindmap(res.mindmap);
        return res.mindmap;
      } else {
        throw new Error(res.error || 'Failed to fetch mindmap');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mindmap, loading, error, loadMindMap };
}
