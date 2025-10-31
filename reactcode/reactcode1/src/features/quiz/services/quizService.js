import { API_ENDPOINTS } from '../../../config/constants';

export const quizService = {
	async fetchQuestions(videoId, currentUser, videoTitle = '') {
		const params = new URLSearchParams({ 
			video_id: videoId, 
			mode: 'quiz',
			video_title: videoTitle,
			video_thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
		});
		if (currentUser) params.append('username', currentUser);
		
		const res = await fetch(`${API_ENDPOINTS.QUESTIONS}?${params.toString()}`);
		const data = await res.json();
		
		if (!res.ok || !data.success) {
			throw new Error(data.error || 'Failed to load questions');
		}
		
		return data.questions;
	},

	normalizeQuestions(questions) {
		return questions.map(q => {
			switch (q.type) {
				case 'mcq':
					return {
						...q,
						options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
						answer: q.correctAnswer || q.answer
					};
				case 'true_false':
					return {
						...q,
						options: ['True', 'False'],
						answer: q.correctAnswer || q.answer
					};
				case 'short_answer':
					return {
						...q,
						answer: q.correctAnswer || q.answer
					};
				default:
					throw new Error(`Unsupported question type: ${q.type}`);
			}
		});
	},

	calculateScore(questions, userAnswers) {
		let correctAnswers = 0;
		let totalAnswered = 0;
		
		questions.forEach(q => {
			if (userAnswers[q._id]) {
				totalAnswered++;
				if (userAnswers[q._id] === (q.correctAnswer || q.answer)) {
					correctAnswers++;
				}
			}
		});
		
		return { correctAnswers, totalAnswered };
	},

	async saveResponse(videoId, questionId, userAnswer, username, videoTitle = '') {
		const res = await fetch(`${API_ENDPOINTS.SAVE_RESPONSE}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				video_id: videoId,
				question_id: questionId,
				user_answer: userAnswer,
				username: username,
				video_title: videoTitle,
				video_thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
			})
		});
		
		const data = await res.json();
		if (!res.ok || !data.success) {
			throw new Error(data.error || 'Failed to save response');
		}
		
		return data;
	}
};
