import { useState, useEffect } from 'react';
import { quizService } from '../services/quizService';

export function useQuiz(videoId, currentUser) {
	const [questions, setQuestions] = useState([]);
	const [userAnswers, setUserAnswers] = useState({});
	const [score, setScore] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchQuestions = async () => {
			setLoading(true);
			setError("");
			setQuestions([]);
			setUserAnswers({});
			setScore(null);
			
			try {
				const rawQuestions = await quizService.fetchQuestions(videoId, currentUser);
				const normalizedQuestions = quizService.normalizeQuestions(rawQuestions);
				setQuestions(normalizedQuestions);
			} catch (err) {
				setError(err.message || 'Something went wrong fetching questions');
			} finally {
				setLoading(false);
			}
		};

		if (videoId) fetchQuestions();
	}, [videoId, currentUser]);

	const handleAnswerChange = (questionId, answer) => {
		setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
	};

	const handleSubmit = async () => {
		const answeredQuestions = Object.keys(userAnswers).length;
		if (answeredQuestions === 0) {
			alert('Please answer at least one question before submitting!');
			return;
		}

		if (!currentUser) {
			alert('Please log in to save your quiz results!');
			return;
		}

		setLoading(true);
		try {
			// Save each response to backend
			for (const [questionId, answer] of Object.entries(userAnswers)) {
				await quizService.saveResponse(videoId, questionId, answer, currentUser);
			}

			// Calculate and display score
			const { correctAnswers, totalAnswered } = quizService.calculateScore(questions, userAnswers);
			setScore(`${correctAnswers} / ${totalAnswered}`);
			alert(`Quiz submitted! Score: ${correctAnswers}/${totalAnswered}`);
		} catch (err) {
			setError(err.message || 'Failed to save quiz responses');
			alert('Error saving quiz. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return {
		questions,
		userAnswers,
		score,
		loading,
		error,
		handleAnswerChange,
		handleSubmit
	};
}
