import React from 'react';
import { useSummary } from '../hooks/useSummary';
import Loading from '../../../components/Loading';

function SummaryContainer({ videoId }) {
	const { summary, loading, error } = useSummary(videoId);

	return (
		<div className="summary-module">
			<h2>Summary</h2>
			{loading && <Loading message="Generating summary..." />}
			{error && <div className="error">{error}</div>}
			{!loading && !error && summary.length > 0 && (
				<ul className="summary-list">
					{summary.map((item, idx) => (
						<li key={idx}>
							{typeof item === 'string' 
								? item 
								: (item.text || item.summary || item.content || JSON.stringify(item))
							}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export default SummaryContainer;
