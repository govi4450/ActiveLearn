import axios from 'axios';

const API_BASE_URL = '/api/goals';

export async function fetchGoals(username) {
	try {
		const response = await axios.get(`${API_BASE_URL}/${username}`);
		return response.data;
	} catch (error) {
		console.error('Error fetching goals:', error);
		throw error;
	}
}

export async function createGoal(username, type, target, metric, endDate) {
	try {
		const response = await axios.post(API_BASE_URL, {
			username,
			type,
			target,
			metric,
			endDate
		});
		return response.data;
	} catch (error) {
		console.error('Error creating goal:', error);
		throw error;
	}
}

export async function updateGoalProgress(goalId, current) {
	try {
		const response = await axios.put(`${API_BASE_URL}/${goalId}`, { current });
		return response.data;
	} catch (error) {
		console.error('Error updating goal:', error);
		throw error;
	}
}

export async function deleteGoal(goalId) {
	try {
		const response = await axios.delete(`${API_BASE_URL}/${goalId}`);
		return response.data;
	} catch (error) {
		console.error('Error deleting goal:', error);
		throw error;
	}
}
