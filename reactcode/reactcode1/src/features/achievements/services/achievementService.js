import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/achievements';

export async function fetchAchievements(username) {
	try {
		const response = await axios.get(`${API_BASE_URL}/${username}`);
		return response.data;
	} catch (error) {
		console.error('Error fetching achievements:', error);
		throw error;
	}
}

export async function unlockAchievement(username, badgeId) {
	try {
		const response = await axios.post(`${API_BASE_URL}/unlock`, {
			username,
			badgeId
		});
		return response.data;
	} catch (error) {
		console.error('Error unlocking achievement:', error);
		throw error;
	}
}

export async function fetchAvailableBadges() {
	try {
		const response = await axios.get(`${API_BASE_URL}/available/all`);
		return response.data;
	} catch (error) {
		console.error('Error fetching available badges:', error);
		throw error;
	}
}
