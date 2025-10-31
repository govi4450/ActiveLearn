import { useState, useEffect } from 'react';
import { fetchAchievements, unlockAchievement, fetchAvailableBadges } from '../services/achievementService';

export function useAchievements(currentUser) {
	const [achievements, setAchievements] = useState([]);
	const [availableBadges, setAvailableBadges] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// intentionally skip listing loadAchievements/loadAvailableBadges in deps
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		if (!currentUser) {
			setLoading(false);
			return;
		}

		loadAchievements();
		loadAvailableBadges();
	}, [currentUser]);

	const loadAchievements = async () => {
		try {
			setLoading(true);
			const data = await fetchAchievements(currentUser);
			setAchievements(data);
			setError(null);
		} catch (err) {
			console.error('Error loading achievements:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const loadAvailableBadges = async () => {
		try {
			const badges = await fetchAvailableBadges();
			setAvailableBadges(badges);
		} catch (err) {
			console.error('Error loading available badges:', err);
		}
	};

	const unlock = async (badgeId) => {
		try {
			const newAchievement = await unlockAchievement(currentUser, badgeId);
			setAchievements(prev => [newAchievement, ...prev]);
			return true;
		} catch (err) {
			console.error('Error unlocking achievement:', err);
			return false;
		}
	};

	return {
		achievements,
		availableBadges,
		loading,
		error,
		unlock,
		refreshAchievements: loadAchievements
	};
}
