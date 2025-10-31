import React, { useState } from 'react';
import { useGoals } from '../hooks/useGoals';
import Loading from '../../../components/Loading';

function GoalsList({ currentUser }) {
	const { goals, loading, error, addGoal, removeGoal } = useGoals(currentUser);
	const [showAddForm, setShowAddForm] = useState(false);
	const [newGoal, setNewGoal] = useState({
		type: 'weekly',
		target: 5,
		metric: 'videos',
		endDate: ''
	});

	if (loading) return <Loading message="Loading goals..." />;
	if (error) return <div className="error">Error loading goals</div>;

	const handleAddGoal = async () => {
		if (!newGoal.endDate) {
			alert('Please select an end date');
			return;
		}

		const success = await addGoal(newGoal.type, newGoal.target, newGoal.metric, newGoal.endDate);
		if (success) {
			setShowAddForm(false);
			setNewGoal({ type: 'weekly', target: 5, metric: 'videos', endDate: '' });
		}
	};

	const handleDeleteGoal = async (goalId) => {
		if (window.confirm('Delete this goal?')) {
			await removeGoal(goalId);
		}
	};

	const getProgressPercentage = (goal) => {
		return Math.min(100, Math.round((goal.current / goal.target) * 100));
	};

	const getMetricLabel = (metric) => {
		const labels = {
			videos: 'Videos',
			quizzes: 'Quizzes',
			study_time: 'Hours',
			score: 'Avg Score'
		};
		return labels[metric] || metric;
	};

	return (
		<div className="goals-list dashboard-card">
			<div className="goals-header">
				<h2>🎯 My Goals</h2>
				<button onClick={() => setShowAddForm(!showAddForm)} className="btn-add-goal">
					{showAddForm ? 'Cancel' : '+ New Goal'}
				</button>
			</div>

			{showAddForm && (
				<div className="add-goal-form">
					<div className="form-row">
						<select 
							value={newGoal.type} 
							onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
							className="form-select"
						>
							<option value="daily">Daily</option>
							<option value="weekly">Weekly</option>
							<option value="monthly">Monthly</option>
							<option value="custom">Custom</option>
						</select>

						<select 
							value={newGoal.metric} 
							onChange={(e) => setNewGoal({ ...newGoal, metric: e.target.value })}
							className="form-select"
						>
							<option value="videos">Videos Watched</option>
							<option value="quizzes">Quizzes Completed</option>
							<option value="study_time">Study Time (hours)</option>
							<option value="score">Average Score</option>
						</select>
					</div>

					<div className="form-row">
						<input
							type="number"
							placeholder="Target"
							value={newGoal.target}
							onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 0 })}
							className="form-input"
							min="1"
						/>

						<input
							type="date"
							value={newGoal.endDate}
							onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
							className="form-input"
						/>
					</div>

					<button onClick={handleAddGoal} className="btn-create-goal">
						Create Goal
					</button>
				</div>
			)}

			{goals.length === 0 ? (
				<div className="empty-state">
					<p>No goals set yet. Create your first learning goal!</p>
				</div>
			) : (
				<div className="goals-items">
					{goals.map((goal) => (
						<div key={goal._id} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
							<div className="goal-header-row">
								<div className="goal-type-badge">{goal.type}</div>
								<button 
									onClick={() => handleDeleteGoal(goal._id)}
									className="btn-delete-goal"
								>
									×
								</button>
							</div>

							<div className="goal-info">
								<h3 className="goal-title">
									{goal.target} {getMetricLabel(goal.metric)}
								</h3>
								<p className="goal-progress-text">
									{goal.current} / {goal.target} {goal.completed && '✓ Completed!'}
								</p>
							</div>

							<div className="goal-progress-bar">
								<div 
									className="goal-progress-fill"
									style={{ width: `${getProgressPercentage(goal)}%` }}
								/>
							</div>

							<div className="goal-footer">
								<span className="goal-percentage">{getProgressPercentage(goal)}%</span>
								<span className="goal-deadline">
									Due: {new Date(goal.endDate).toLocaleDateString()}
								</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default GoalsList;
