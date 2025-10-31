import { useState, useEffect } from 'react';
import { practiceService } from '../services/practiceService';

export function usePractice(videoId, currentUser) {
	const [questions, setQuestions] = useState([]);
	const [userAnswers, setUserAnswers] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchQuestions = async () => {
			setLoading(true);
			setError("");
			setQuestions([]);
			setUserAnswers({});
			
			try {
				const rawQuestions = await practiceService.fetchQuestions(videoId, currentUser);
				const normalizedQuestions = practiceService.normalizeQuestions(rawQuestions);
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

	return {
		questions,
		userAnswers,
		loading,
		error,
		handleAnswerChange
	};
}
