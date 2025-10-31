import { useState, useEffect } from 'react';
import { fetchRecentActivity } from '../services/dashboardService';

export function useRecentActivity(currentUser) {
	const [activities, setActivities] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!currentUser) {
			setLoading(false);
			return;
		}

		const loadActivity = async () => {
			try {
				setLoading(true);
				const data = await fetchRecentActivity(currentUser);
				setActivities(data);
				setError(null);
			} catch (err) {
				console.error('Error loading activity:', err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		loadActivity();
	}, [currentUser]);

	return { activities, loading, error };
}
