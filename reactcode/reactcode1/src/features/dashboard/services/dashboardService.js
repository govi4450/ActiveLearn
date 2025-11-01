import axios from 'axios';

const API_BASE_URL = '/api';

export async function fetchDashboardAnalytics(username) {
	try {
		const response = await axios.get(`${API_BASE_URL}/dashboard/analytics/${username}`);
		return response.data;
	} catch (error) {
		console.error('Error fetching analytics:', error);
		// Return default values if API fails
		return {
			totalVideos: 0,
			totalQuizzes: 0,
			averageScore: 0,
			practiceCount: 0,
			studyStreak: 0,
			totalStudyTime: 0
		};
	}
}

export async function fetchRecentActivity(username) {
	try {
		const response = await axios.get(`${API_BASE_URL}/dashboard/activity/${username}`);
		return response.data;
	} catch (error) {
		console.error('Error fetching activity:', error);
		// Return empty array if API fails
		return [];
	}
}
