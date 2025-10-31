import React from 'react';
import { usePractice } from '../hooks/usePractice';
import PracticeQuestionItem from './PracticeQuestionItem';
import Loading from '../../../components/Loading';

function PracticeContainer({ videoId, currentUser }) {
	const {
		questions,
		userAnswers,
		loading,
		error,
		handleAnswerChange
	} = usePractice(videoId, currentUser);

	return (
		<div className="practice-module">
			<h2>Practice</h2>
			{loading && <Loading message="Loading practice questions..." />}
			{error && <div className="error">{error}</div>}
			{!loading && !error && questions.length > 0 && (
				<div>
					{questions.map((q, idx) => (
						<PracticeQuestionItem 
							key={q._id || q.id || idx} 
							question={q} 
							onAnswerChange={handleAnswerChange}
							selectedAnswer={userAnswers[q._id]}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export default PracticeContainer;
