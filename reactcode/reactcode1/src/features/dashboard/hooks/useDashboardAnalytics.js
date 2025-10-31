import { useState, useEffect } from 'react';
import { fetchDashboardAnalytics } from '../services/dashboardService';

export function useDashboardAnalytics(currentUser) {
	const [analytics, setAnalytics] = useState({
		totalVideos: 0,
		totalQuizzes: 0,
		averageScore: 0,
		practiceCount: 0,
		studyStreak: 0,
		totalStudyTime: 0
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!currentUser) {
			setLoading(false);
			return;
		}

		const loadAnalytics = async () => {
			try {
				setLoading(true);
				const data = await fetchDashboardAnalytics(currentUser);
				setAnalytics(data);
				setError(null);
			} catch (err) {
				console.error('Error loading analytics:', err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		loadAnalytics();
	}, [currentUser]);

	return { analytics, loading, error };
}
