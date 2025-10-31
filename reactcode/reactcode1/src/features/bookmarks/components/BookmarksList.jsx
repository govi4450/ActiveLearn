import React from 'react';
import { useBookmarks } from '../hooks/useBookmarks';
import Loading from '../../../components/Loading';

function BookmarksList({ currentUser, onVideoSelect }) {
	const { bookmarks, loading, error, removeFromBookmarks } = useBookmarks(currentUser);

	if (loading) return <Loading message="Loading bookmarks..." />;
	if (error) return <div className="error">Error loading bookmarks</div>;

	const handleRemove = async (videoId) => {
		if (window.confirm('Remove this bookmark?')) {
			await removeFromBookmarks(videoId);
		}
	};

	return (
		<div className="bookmarks-list dashboard-card">
			<div className="bookmarks-header">
				<h2>📚 My Bookmarks</h2>
				<span className="bookmark-count">{bookmarks.length} saved</span>
			</div>

			{bookmarks.length === 0 ? (
				<div className="empty-state">
					<p>No bookmarks yet. Start saving your favorite videos!</p>
				</div>
			) : (
				<div className="bookmarks-grid">
					{bookmarks.map((bookmark) => (
						<div key={bookmark._id} className="bookmark-item">
							{bookmark.videoThumbnail && (
								<img 
									src={bookmark.videoThumbnail} 
									alt={bookmark.videoTitle}
									className="bookmark-thumbnail"
								/>
							)}
							<div className="bookmark-content">
								<h3 className="bookmark-title">{bookmark.videoTitle}</h3>
								<p className="bookmark-date">
									Saved {new Date(bookmark.createdAt).toLocaleDateString()}
								</p>
								{bookmark.notes && (
									<p className="bookmark-notes">{bookmark.notes}</p>
								)}
							</div>
							<div className="bookmark-actions">
								<button 
									className="btn-view"
									onClick={() => onVideoSelect && onVideoSelect(bookmark.videoId)}
								>
									View
								</button>
								<button 
									className="btn-remove"
									onClick={() => handleRemove(bookmark.videoId)}
								>
									Remove
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default BookmarksList;
