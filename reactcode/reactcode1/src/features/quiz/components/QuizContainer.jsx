import React from 'react';
import { useQuiz } from '../hooks/useQuiz';
import QuestionItem from './QuestionItem';
import Loading from '../../../components/Loading';

function QuizContainer({ videoId, currentUser }) {
	const {
		questions,
		userAnswers,
		score,
		loading,
		error,
		handleAnswerChange,
		handleSubmit
	} = useQuiz(videoId, currentUser);

	return (
		<div className="questions-module">
			<h2>Quiz</h2>
			{loading && <Loading message="Generating questions..." />}
			{error && <div className="error">{error}</div>}
			{!loading && !error && questions.length > 0 && (
				<>
					<ul className="question-list">
						{questions.map((q, idx) => (
							<QuestionItem 
								key={q._id || idx} 
								question={q} 
								onAnswerChange={handleAnswerChange}
								selectedAnswer={userAnswers[q._id]}
							/>
						))}
					</ul>
					<button className="submit-btn" onClick={handleSubmit}>Submit Quiz</button>
					{score !== null && <div className="quiz-score">Your score: {score}</div>}
				</>
			)}
		</div>
	);
}

export default QuizContainer;
