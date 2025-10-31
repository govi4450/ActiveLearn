import React from 'react';
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import Loading from '../../../components/Loading';

function AnalyticsOverview({ currentUser }) {
	const { analytics, loading, error } = useDashboardAnalytics(currentUser);

	if (loading) return <Loading message="Loading analytics..." />;
	if (error) return <div className="error">Failed to load analytics</div>;

	return (
		<div className="analytics-overview dashboard-card">
			<div className="analytics-header">
				<h2>Learning Analytics</h2>
			</div>
			
			<div className="analytics-grid">
				<div className="analytics-card">
					<div className="analytics-icon">📹</div>
					<div className="analytics-content">
						<div className="analytics-value">{analytics.totalVideos || 0}</div>
						<div className="analytics-label">Videos Watched</div>
					</div>
				</div>
				
				<div className="analytics-card">
					<div className="analytics-icon">📝</div>
					<div className="analytics-content">
						<div className="analytics-value">{analytics.totalQuizzes || 0}</div>
						<div className="analytics-label">Quizzes Taken</div>
					</div>
				</div>
				
				<div className="analytics-card">
					<div className="analytics-icon">⭐</div>
					<div className="analytics-content">
						<div className="analytics-value">{analytics.averageScore || 0}%</div>
						<div className="analytics-label">Average Score</div>
					</div>
				</div>
				
				<div className="analytics-card">
					<div className="analytics-icon">💪</div>
					<div className="analytics-content">
						<div className="analytics-value">{analytics.practiceCount || 0}</div>
						<div className="analytics-label">Practice Sessions</div>
					</div>
				</div>
				
				<div className="analytics-card">
					<div className="analytics-icon">🔥</div>
					<div className="analytics-content">
						<div className="analytics-value">{analytics.studyStreak || 0}</div>
						<div className="analytics-label">Day Streak</div>
					</div>
				</div>
				
				<div className="analytics-card">
					<div className="analytics-icon">⏱️</div>
					<div className="analytics-content">
						<div className="analytics-value">{analytics.totalStudyTime || 0}h</div>
						<div className="analytics-label">Study Time</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default AnalyticsOverview;
