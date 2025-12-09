import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PerformanceCharts({ currentUser }) {
	const [chartData, setChartData] = useState(null);
	const [loading, setLoading] = useState(true);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		if (currentUser) {
			fetchChartData();
		}
	}, [currentUser]);

	const fetchChartData = async () => {
		try {
			setLoading(true);
			const response = await axios.get(`/api/dashboard/analytics/${currentUser}`);
			setChartData(response.data);
		} catch (error) {
			console.error('Error fetching chart data:', error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) return <div>Loading charts...</div>;
	if (!chartData) return null;

	const { totalVideos, totalQuizzes, averageScore, practiceCount } = chartData;

	// Simple bar chart using CSS
	const maxValue = Math.max(totalVideos, totalQuizzes, practiceCount, 10);

	return (
		<div className="performance-charts dashboard-card">
			<div className="charts-header">
				<h2>📊 Performance Overview</h2>
			</div>

			<div className="charts-container">
				{/* Bar Chart */}
				<div className="chart-section">
					<h3>Activity Summary</h3>
					<div className="bar-chart">
						<div className="bar-item">
							<div className="bar-label">Videos</div>
							<div className="bar-container">
								<div 
									className="bar-fill bar-videos"
									style={{ width: `${(totalVideos / maxValue) * 100}%` }}
								>
									<span className="bar-value">{totalVideos}</span>
								</div>
							</div>
						</div>

						<div className="bar-item">
							<div className="bar-label">Quizzes</div>
							<div className="bar-container">
								<div 
									className="bar-fill bar-quizzes"
									style={{ width: `${(totalQuizzes / maxValue) * 100}%` }}
								>
									<span className="bar-value">{totalQuizzes}</span>
								</div>
							</div>
						</div>

						<div className="bar-item">
							<div className="bar-label">Practice</div>
							<div className="bar-container">
								<div 
									className="bar-fill bar-practice"
									style={{ width: `${(practiceCount / maxValue) * 100}%` }}
								>
									<span className="bar-value">{practiceCount}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Score Gauge */}
				<div className="chart-section">
					<h3>Average Score</h3>
					<div className="score-gauge">
						<div className="gauge-circle">
							<svg viewBox="0 0 100 100" className="gauge-svg">
								<circle
									cx="50"
									cy="50"
									r="40"
									fill="none"
									stroke="#e0e0e0"
									strokeWidth="8"
								/>
								<circle
									cx="50"
									cy="50"
									r="40"
									fill="none"
									stroke={averageScore >= 80 ? '#00b894' : averageScore >= 60 ? '#fdcb6e' : '#e17055'}
									strokeWidth="8"
									strokeDasharray={`${(averageScore / 100) * 251.2} 251.2`}
									strokeLinecap="round"
									transform="rotate(-90 50 50)"
								/>
							</svg>
							<div className="gauge-value">{averageScore}%</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default PerformanceCharts;
