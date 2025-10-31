import { useState, useEffect } from 'react';
import { fetchGoals, createGoal, updateGoalProgress, deleteGoal } from '../services/goalService';

export function useGoals(currentUser) {
	const [goals, setGoals] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		if (!currentUser) {
			setLoading(false);
			return;
		}

		loadGoals();
	}, [currentUser]);

	const loadGoals = async () => {
		try {
			setLoading(true);
			const data = await fetchGoals(currentUser);
			setGoals(data);
			setError(null);
		} catch (err) {
			console.error('Error loading goals:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const addGoal = async (type, target, metric, endDate) => {
		try {
			const newGoal = await createGoal(currentUser, type, target, metric, endDate);
			setGoals(prev => [newGoal, ...prev]);
			return true;
		} catch (err) {
			console.error('Error creating goal:', err);
			return false;
		}
	};

	const updateProgress = async (goalId, current) => {
		try {
			const updatedGoal = await updateGoalProgress(goalId, current);
			setGoals(prev => prev.map(g => g._id === goalId ? updatedGoal : g));
			return true;
		} catch (err) {
			console.error('Error updating goal:', err);
			return false;
		}
	};

	const removeGoal = async (goalId) => {
		try {
			await deleteGoal(goalId);
			setGoals(prev => prev.filter(g => g._id !== goalId));
			return true;
		} catch (err) {
			console.error('Error removing goal:', err);
			return false;
		}
	};

	return {
		goals,
		loading,
		error,
		addGoal,
		updateProgress,
		removeGoal,
		refreshGoals: loadGoals
	};
}
