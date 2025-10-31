import React from 'react';

function QuickActions({ currentUser, onNavigateToVideos }) {
	const actions = [
		{
			icon: '🎥',
			title: 'Explore Videos',
			description: 'Search and watch educational videos',
			action: onNavigateToVideos,
			color: '#00b894'
		},
		{
			icon: '📊',
			title: 'View Progress',
			description: 'Check your learning progress',
			action: () => alert('Progress Details - Coming Soon!'),
			color: '#0984e3'
		},
		{
			icon: '🎯',
			title: 'Set Goals',
			description: 'Create learning objectives',
			action: () => alert('Goal Setting - Coming Soon!'),
			color: '#e84393'
		},
		{
			icon: '🏆',
			title: 'Achievements',
			description: 'View your badges and rewards',
			action: () => alert('Achievements - Coming Soon!'),
			color: '#fdcb6e'
		},
		{
			icon: '📝',
			title: 'Feedback Reports',
			description: 'View engagement analytics',
			action: () => alert('Feedback Reports - Coming Soon!'),
			color: '#ff6a00'
		}
	];

	return (
		<div className="quick-actions dashboard-card">
			<div className="quick-actions-header">
				<h2>Quick Actions</h2>
			</div>
			
			<div className="quick-actions-list">
				{actions.map((action, index) => (
					<button 
						key={index}
						className="quick-action-item"
						onClick={action.action}
						style={{ borderLeft: `4px solid ${action.color}` }}
					>
						<div className="quick-action-icon">{action.icon}</div>
						<div className="quick-action-content">
							<div className="quick-action-title">{action.title}</div>
							<div className="quick-action-description">{action.description}</div>
						</div>
						<div className="quick-action-arrow">→</div>
					</button>
				))}
			</div>
		</div>
	);
}

export default QuickActions;
