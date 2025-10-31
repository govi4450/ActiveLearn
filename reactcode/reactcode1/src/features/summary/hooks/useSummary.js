import { useState, useEffect } from 'react';
import { summaryService } from '../services/summaryService';

export function useSummary(videoId) {
	const [summary, setSummary] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchSummary = async () => {
			setLoading(true);
			setError("");
			setSummary([]);
			try {
				const data = await summaryService.fetchSummary(videoId);
				if (data.summary && Array.isArray(data.summary)) {
					setSummary(data.summary);
				} else {
					setSummary([data.summary || "No summary available"]);
				}
			} catch (err) {
				setError(err.response?.data?.error || err.message);
			} finally {
				setLoading(false);
			}
		};

		if (videoId) {
			fetchSummary();
		}
	}, [videoId]);

	return { summary, loading, error };
}
