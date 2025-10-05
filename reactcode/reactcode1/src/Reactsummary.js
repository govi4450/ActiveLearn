import React, { useState, useEffect } from 'react';
import axios from 'axios';

const backendUrl = "http://127.0.0.1:3000/"; // Replace with your backend URL

function ReactSummary({ videoId }) {
	const [summary, setSummary] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const summarizeVideo = async () => {
			setLoading(true);
			setError("");
			setSummary([]);
			try {
				const response = await axios.get(`${backendUrl}api/summarize`, { params: { video_id: videoId } });
				const data = response.data;
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
			summarizeVideo();
		}
	}, [videoId]);

	return (
		<div className="summary-module">
			{loading && <div className="loading">Generating summary...</div>}
			{error && <div className="error">{error}</div>}
			{!loading && !error && summary.length > 0 && (
				<ul className="summary-list">
					{summary.map((item, idx) => (
						<li key={idx}>{typeof item === 'string' ? item : (item.text || item.summary || item.content || JSON.stringify(item))}</li>
					))}
				</ul>
			)}
		</div>
	);
}

export default ReactSummary;
