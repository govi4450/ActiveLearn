import React from 'react';
import { useAchievements } from '../hooks/useAchievements';
import Loading from '../../../components/Loading';

function AchievementsList({ currentUser }) {
	const { achievements, availableBadges, loading, error } = useAchievements(currentUser);

	if (loading) return <Loading message="Loading achievements..." />;
	if (error) return <div className="error">Error loading achievements</div>;

	const unlockedIds = new Set(achievements.map(a => a.badgeId));

	return (
		<div className="achievements-list dashboard-card">
			<div className="achievements-header">
				<h2>🏆 Achievements</h2>
				<span className="achievements-count">
					{achievements.length} / {availableBadges.length} unlocked
				</span>
			</div>

			<div className="achievements-grid">
				{availableBadges.map((badge) => {
					const isUnlocked = unlockedIds.has(badge.id);
					const achievement = achievements.find(a => a.badgeId === badge.id);

					return (
						<div 
							key={badge.id} 
							className={`achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`}
						>
							<div className="achievement-icon">
								{isUnlocked ? badge.icon : '🔒'}
							</div>
							<div className="achievement-info">
								<h3 className="achievement-name">
									{isUnlocked ? badge.name : '???'}
								</h3>
								<p className="achievement-description">
									{isUnlocked ? badge.description : 'Keep learning to unlock!'}
								</p>
								{isUnlocked && achievement && (
									<p className="achievement-date">
										Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
									</p>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{achievements.length === 0 && (
				<div className="empty-state">
					<p>Start learning to unlock achievements!</p>
				</div>
			)}
		</div>
	);
}

export default AchievementsList;
