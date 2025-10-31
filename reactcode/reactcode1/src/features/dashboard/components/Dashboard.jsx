import React, { useState } from 'react';
import ProfileSection from './ProfileSection';
import AnalyticsOverview from './AnalyticsOverview';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import BookmarksList from '../../bookmarks/components/BookmarksList';
import NotesList from '../../notes/components/NotesList';
import AchievementsList from '../../achievements/components/AchievementsList';
import PerformanceCharts from '../../charts/components/PerformanceCharts';
import LearningLibrary from '../../library/components/LearningLibrary';

function Dashboard({ currentUser, onLogout, onNavigateToVideos }) {
	const [activeTab, setActiveTab] = useState('overview');
	const [selectedVideo, setSelectedVideo] = useState(null);

	const handleVideoSelect = (videoId) => {
		setSelectedVideo(videoId);
	};

	const closeVideoPlayer = () => {
		setSelectedVideo(null);
	};

	return (
		<div className="dashboard-container">
			<div className="dashboard-header">
				<h1>Dashboard</h1>
				<button className="back-to-videos-btn" onClick={onNavigateToVideos}>
					← Back to Videos
				</button>
			</div>

			{/* Dashboard Navigation Tabs */}
			<div className="dashboard-tabs">
				<button 
					className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
					onClick={() => setActiveTab('overview')}
				>
					📊 Overview
				</button>
				<button 
					className={`tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
					onClick={() => setActiveTab('bookmarks')}
				>
					📚 Bookmarks
				</button>
				<button 
					className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
					onClick={() => setActiveTab('notes')}
				>
					📝 Notes
				</button>
				<button 
					className={`tab-btn ${activeTab === 'library' ? 'active' : ''}`}
					onClick={() => setActiveTab('library')}
				>
					📚 Learning Library
				</button>
				<button 
					className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
					onClick={() => setActiveTab('achievements')}
				>
					🏆 Achievements
				</button>
			</div>
			
			{/* Tab Content */}
			{activeTab === 'overview' && (
				<>
					<div className="dashboard-grid">
						<div className="dashboard-main">
							<ProfileSection currentUser={currentUser} onLogout={onLogout} />
							<AnalyticsOverview currentUser={currentUser} />
							<PerformanceCharts currentUser={currentUser} />
							<RecentActivity currentUser={currentUser} onVideoSelect={handleVideoSelect} />
						</div>
						
						<div className="dashboard-sidebar">
							<QuickActions currentUser={currentUser} onNavigateToVideos={onNavigateToVideos} />
						</div>
					</div>
					
					{selectedVideo && (
						<div className="video-player-modal" onClick={closeVideoPlayer}>
							<div className="video-player-content" onClick={(e) => e.stopPropagation()}>
								<button className="close-video-btn" onClick={closeVideoPlayer}>✕</button>
								<iframe
									src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
									title="Video Player"
									allowFullScreen
									allow="autoplay"
									className="video-player-iframe"
								/>
							</div>
						</div>
					)}
				</>
			)}

			{activeTab === 'bookmarks' && (
				<BookmarksList currentUser={currentUser} onVideoSelect={onNavigateToVideos} />
			)}

			{activeTab === 'notes' && (
				<NotesList currentUser={currentUser} />
			)}

			{activeTab === 'library' && (
				<LearningLibrary currentUser={currentUser} />
			)}

			{activeTab === 'achievements' && (
				<AchievementsList currentUser={currentUser} />
			)}
		</div>
	);
}

export default Dashboard;
