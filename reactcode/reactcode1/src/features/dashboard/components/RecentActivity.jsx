import React from 'react';
import { useRecentActivity } from '../hooks/useRecentActivity';
import Loading from '../../../components/Loading';

function RecentActivity({ currentUser, onVideoSelect }) {
	const { activities, loading, error } = useRecentActivity(currentUser);

	const formatTimestamp = (timestamp) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	};

	const getActivityBadge = (activityType) => {
		if (activityType === 'quiz') {
			return <span className="activity-badge quiz-badge">Quiz</span>;
		} else if (activityType === 'practice') {
			return <span className="activity-badge practice-badge">Practice</span>;
		}
		return null;
	};

	if (loading) return <Loading message="Loading watch history..." />;
	if (error) return <div className="error">Failed to load watch history</div>;

	return (
		<div className="recent-activity dashboard-card">
			<div className="activity-header">
				<h2>📺 Watch History</h2>
				<p className="activity-subtitle">Continue watching your recent videos</p>
			</div>
			
			<div className="watch-history-grid">
				{activities && activities.length > 0 ? (
					activities.map((activity, index) => (
						<div 
							key={index} 
							className="watch-history-item"
							onClick={() => onVideoSelect && onVideoSelect(activity.videoId)}
						>
							<div className="video-thumbnail-wrapper">
								<img 
									src={activity.videoThumbnail} 
									alt={activity.title}
									className="video-thumbnail"
								/>
								<div className="play-overlay">
									<div className="play-icon">▶</div>
								</div>
								{getActivityBadge(activity.activityType)}
							</div>
							<div className="video-info">
								<h3 className="video-title">{activity.title}</h3>
								<div className="video-meta">
									<span className="video-time">{formatTimestamp(activity.timestamp)}</span>
									{activity.score !== undefined && activity.score !== null && (
										<span className="video-score">• Score: {activity.score}%</span>
									)}
								</div>
								<p className="video-description">{activity.description}</p>
							</div>
						</div>
					))
				) : (
					<div className="activity-empty">
						<div className="empty-icon">📺</div>
						<p>No watch history yet</p>
						<p className="empty-subtitle">Videos you watch will appear here</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default RecentActivity;
