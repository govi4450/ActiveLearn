import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, FileText, Zap, Target, StickyNote, Map } from 'lucide-react';
import BookmarkButton from '../../bookmarks/components/BookmarkButton';

export default function VideoCardCanonical({
  video,
  onSummarize,
  onQuiz,
  onPractice,
  onMindMap,
  onPlay,
  onExpand,
  onNotes,
  currentUser,
  isPlaying = false,
  featured = false,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const videoId = video?.id?.videoId || video?.id;

  const formatDuration = (duration) => {
    if (!duration) return '';
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '';
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    if (hours) return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
  };

  const formatTimeAgo = (publishedAt) => {
    if (!publishedAt) return '';
    const now = new Date();
    const published = new Date(publishedAt);
    const diffInSeconds = Math.floor((now - published) / 1000);
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  };

  const actionButtons = useMemo(() => [
    { icon: FileText, label: 'Summary', onClick: () => onSummarize && onSummarize(videoId), color: 'from-emerald-500 to-emerald-600' },
    { icon: Zap, label: 'Quiz', onClick: () => onQuiz && onQuiz(videoId), color: 'from-cyan-500 to-blue-600' },
    { icon: Target, label: 'Practice', onClick: () => onPractice && onPractice(videoId), color: 'from-pink-500 to-rose-600' },
    { icon: StickyNote, label: 'Notes', onClick: () => onNotes && onNotes(videoId), color: 'from-orange-500 to-amber-600' },
    { icon: Map, label: 'Mind Map', onClick: () => onMindMap && onMindMap(videoId), color: 'from-purple-500 to-indigo-600' },
  ], [videoId, onSummarize, onQuiz, onPractice, onNotes, onMindMap]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 bg-[#0f1724] ${featured ? 'col-span-full' : ''}`}
    >
      {featured && (
        <div className="absolute top-3 left-3 px-3 py-1.5 bg-emerald-400 rounded-lg text-black text-sm font-semibold z-30">FEATURED</div>
      )}

      <div className={`absolute top-3 right-3 z-30 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <BookmarkButton currentUser={currentUser} videoId={videoId} videoTitle={video?.snippet?.title} />
      </div>

      <div className={`${featured ? 'h-96' : 'h-56'} relative bg-black` }>
        {isPlaying ? (
          <div className="w-full h-full relative">
            <iframe
              title={`video-${videoId}`}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />

            <div
              onClick={(e) => { e.stopPropagation(); onPlay && onPlay(videoId); }}
              className="absolute left-0 right-0 top-0"
              style={{ bottom: '72px', zIndex: 40 }}
            />
          </div>
        ) : (
          <motion.img
            src={video?.snippet?.thumbnails?.high?.url}
            alt={video?.snippet?.title}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.03 : 1 }}
            transition={{ duration: 0.35 }}
            onClick={(e) => { e.stopPropagation(); onPlay && onPlay(videoId); }}
            style={{ cursor: 'pointer' }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

        {/* central play button shown when not playing (keeps pointer-events-none on container but the button itself is interactive) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          {!isPlaying && (
            <div
              onClick={(e) => { e.stopPropagation(); onPlay && onPlay(videoId); }}
              className="pointer-events-auto w-20 h-20 bg-white/10 backdrop-blur rounded-full flex items-center justify-center border-2 border-white/20 cursor-pointer"
              title="Play"
            >
              <Play className="w-10 h-10 text-white" />
            </div>
          )}
        </div>

        {/* small expand button adjacent to bookmark - opens parent modal/expand if provided */}
        <div className={`absolute top-3 right-12 z-30 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {onExpand && (
            <button
              onClick={(e) => { e.stopPropagation(); onExpand && onExpand(videoId); }}
              className="pointer-events-auto px-2 py-1 bg-black/60 text-white rounded-md text-sm"
              title="Open"
            >
              Open
            </button>
          )}
        </div>

        {video?.contentDetails?.duration && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/70 rounded text-white text-sm font-medium z-30 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {formatDuration(video.contentDetails.duration)}
          </div>
        )}

  <div className={`absolute left-0 right-0 flex items-center justify-center gap-3 px-4 z-40 pointer-events-none transition-opacity duration-200 ${ (isHovered || isPlaying) ? 'opacity-100' : 'opacity-0' } ${isPlaying ? 'bottom-28' : 'bottom-4'}`}>
          {actionButtons.map((btn, i) => {
            const Icon = btn.icon;
            return (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); btn.onClick(); }}
                className={`pointer-events-auto p-2.5 rounded-lg text-white bg-gradient-to-br ${btn.color} shadow-lg flex items-center justify-center`}
                title={btn.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        <h3 className={`text-white font-semibold mb-1 ${featured ? 'text-2xl' : 'text-lg'}`}>{video?.snippet?.title}</h3>
        <div className="text-sm text-gray-300 flex items-center gap-2">
          <span>{video?.snippet?.channelTitle}</span>
          <span className="opacity-60">•</span>
          <span className="opacity-70">{formatTimeAgo(video?.snippet?.publishedAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}
