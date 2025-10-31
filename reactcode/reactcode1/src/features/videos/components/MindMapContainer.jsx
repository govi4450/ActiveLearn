import React, { useEffect } from 'react';
import MindMapViewer from './MindMapViewer';
import { useMindMap } from '../hooks/useMindMap';

export default function MindMapContainer({ videoId }) {
  const { mindmap, loading, error, loadMindMap } = useMindMap();

  useEffect(() => {
    if (videoId) loadMindMap(videoId).catch(() => {});
  }, [videoId]);

  if (loading) return <div className="p-6">Generating mind map... this can take a few seconds.</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!mindmap) return <div className="p-6">No mind map available.</div>;

  return (
    <div className="p-6">
      <MindMapViewer mindmap={mindmap} />
    </div>
  );
}
