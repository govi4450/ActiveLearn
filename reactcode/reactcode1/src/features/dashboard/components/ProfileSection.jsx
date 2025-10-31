import React from 'react';

function ProfileSection({ currentUser, onLogout }) {
	const getInitials = (username) => {
		return username ? username.substring(0, 2).toUpperCase() : 'U';
	};

	const getMemberSince = () => {
		// For now, using localStorage timestamp or current date
		const joinDate = localStorage.getItem('userJoinDate') || new Date().toISOString();
		return new Date(joinDate).toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric' 
		});
	};

	return (
		<div className="profile-section dashboard-card">
			<div className="profile-header">
				<h2>Profile</h2>
			</div>
			
			<div className="profile-content">
				<div className="profile-avatar">
					<div className="avatar-circle">
						{getInitials(currentUser)}
					</div>
				</div>
				
				<div className="profile-info">
					<h3 className="profile-username">{currentUser || 'Guest'}</h3>
					<p className="profile-member-since">Member since {getMemberSince()}</p>
					
					<div className="profile-stats-mini">
						<div className="stat-mini">
							<span className="stat-icon">🎓</span>
							<span className="stat-label">Learner</span>
						</div>
					</div>
				</div>
			</div>
			
			<div className="profile-actions">
				<button className="btn-secondary" onClick={() => alert('Edit Profile - Coming Soon!')}>
					Edit Profile
				</button>
				<button className="btn-danger" onClick={onLogout}>
					Logout
				</button>
			</div>
		</div>
	);
}

export default ProfileSection;
